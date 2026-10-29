# Axolotl for plugin developers

This is for Grasshopper plugins that build on Axolotl, either by providing their own distance objects (implementing `IHasDistance`) or by evaluating Axolotl objects in their own components.

The evaluation engine was reworked for Axolotl 2.0. It is parallel and batched. It skips regions far from the surface and simplifies the object tree per region. It also computes exact gradients and can mesh with sharp features. All of this is **opt-in** through optional interfaces: existing plugins keep working without changes, but only objects that implement the new interfaces benefit fully.

## 1. What stays compatible

- `IHasDistance` is unchanged (namespace `Axolotl`, one method `double GetDistance(double x, double y, double z)`).
- `GooHasDistance` is unchanged. `Duplicate()` now keeps the value (it used to return an empty object).
- Objects that only implement `GetDistance` work everywhere: inside every Axolotl combinator and modifier, and in every mesher.
- `MeshWrapper(Mesh)` and `BrepWrapper(Brep)` keep their constructors. New overloads take a `SurfaceSign?` (`Unsigned`, `Solid`, `Side`; `null` = signed if closed). `MeshWrapper` now evaluates on a managed triangle tree and signs solids by winding number, so leaky meshes (holes, unwelded seams) get a correct inside.
- Hidden components (old Sweep, old Wrapper, TPMS P/S/D, Polarize, ...) keep their GUIDs and still load in old files.

### Breaking changes in helper APIs

Code that calls these directly has to be updated and recompiled:

| Removed / changed | Use instead |
|------------------------------------|------------------------------------|
| `MarchingCube2` (class) | `MarchingCube.Polygonize` |
| `MarchingCube.MarchingCubesParallelMesh(...)` | `MarchingCube.MarchingCubesMesh(...)` (now parallel) or `MarchingCube.Polygonize` |
| `Octree(float x, float y, float z, float size)` | `Octree(double x, double y, double z, double size)` |
| `Octree.root`, `Octree.OctNode`, `Octree.MakeCube` | removed; use `Octree.DivideForMesh` / `DivideRaw` |
| `GradientVector.GetGradient(..., unit: false)` returned 4·eps·gradient | returns the actual gradient |

## 2. Thread safety (please check)

**`GetDistance` is now called from many threads at the same time**, by every mesher, Dense Grid, Evaluate Points and Slice. Before, the default mesher ran on a single thread.

- Keep distance objects **immutable** after construction. Axolotl shares one object between threads and between Grasshopper solutions, and pruning creates new objects instead of modifying existing ones.
- No shared mutable state in `GetDistance`: no caches without locking, no reused member buffers. Temporary arrays can be taken from `Scratch.Rent(n)` / `Scratch.Return(a)` (per thread).
- Rhino geometry: build lazily created search structures before evaluation starts, for example with one `ClosestPoint` call in the constructor. Axolotl also evaluates every object once on the calling thread before going parallel (`Distance.Warmup`).

## 3. Providing distance objects: the optional interfaces

All interfaces are in namespace `Axolotl`. Implement as many as make sense; each one is independent. Without them your object is a black box: in any tree it is part of, there is no narrow band, no pruning of or below your object, finite-difference normals and one virtual call per point.

| Interface | Effort | Benefit |
|------------------------|------------------------|------------------------|
| `ILipschitzBound` | one line | narrow band (regions far from the surface are skipped) |
| `IHasBounds` | a few lines | large unions skip your object far away (bounding volume hierarchy) |
| `IHasChildren` | one line (combinators / modifiers) | subtrees used several times are evaluated once |
| `IIntervalBound` | a method | tighter narrow band, also for non-distance fields; pruning |
| `IHasGradient` | a method | exact normals (Dual Contouring Adaptive keeps sharp edges) |
| `IHasDistanceBatch` | a method | less call overhead, room for SIMD |

### Contracts

Axolotl relies on these guarantees for correctness, not just speed. A wrong bound can make meshes miss geometry, so only claim what holds everywhere.

- **`ILipschitzBound.Lipschitz`**: an upper bound `L` with `|d(p) - d(q)| <= L |p - q|` for all points. Exact signed distance fields have `L = 1`; most "bound" distance functions (max of plane distances, etc.) too. Return `double.PositiveInfinity` if unknown. Fields that **jump** (e.g. using `%`, domain repetition, sector or cell boundaries) have no bound.
- **`IHasBounds.TryGetBounds`**: a box `B` such that for every point `p` **outside** `B`, `GetDistance(p) >= distance(p, B)`. Inside `B` nothing is assumed. For an exact distance field this is the bounding box of the solid. Return `false` if unknown or unbounded.
- **`IHasChildren.Children`**: the direct sub-objects (used to detect shared subtrees).
- **`IIntervalBound.Bound(Region region, bool prune, out IHasDistance pruned)`**: a `ValueRange` that contains `GetDistance(p)` for **every** `p` in the closed box `region`. If `prune` is true, `pruned` may return a simpler object that gives **exactly the same values (bit for bit) everywhere inside `region`**, e.g. a union without the operands that cannot be the minimum there. Otherwise return `this`. Bound operands with `Distance.Bound(...)`: it falls back to the Lipschitz bound for operands without interval support and caches shared subtrees.
  Fields without a Lipschitz bound can still get narrow band sampling through this interface alone. Example: `Fillet` and `GradientBlend` (base class `GradientCombination`) depend on the angle between the operand gradients, so no Lipschitz constant is known. Their values stay within `[min(a, b) - r, min(a, b)]` (union), and that interval is what they return.
- **`IHasGradient.GetGradient(x, y, z, eps, out gx, out gy, out gz)`**: returns the value (same as `GetDistance`) and its gradient. `eps` is the step for finite differences of operands without gradients; pass it on with `Distance.Gradient(...)`.
- **`IHasDistanceBatch.GetDistances(x, y, z, result, count)`**: same values as `count` calls of `GetDistance`. The arrays can be longer than `count`. Evaluate operands with `Distance.Evaluate(...)` (batch path of the operand plus the shared-subtree cache).

### Example: a primitive

``` csharp
using System;
using Rhino.Geometry;
using Axolotl;

public class MyBall : IHasDistanceBatch, ILipschitzBound, IHasBounds, IIntervalBound, IHasGradient
{
    readonly double cx, cy, cz, r;   // immutable: the object is shared between threads

    public MyBall(Point3d center, double radius) { cx = center.X; cy = center.Y; cz = center.Z; r = radius; }

    public double GetDistance(double x, double y, double z)
    {
        double dx = x - cx, dy = y - cy, dz = z - cz;
        return Math.Sqrt(dx * dx + dy * dy + dz * dz) - r;
    }

    public void GetDistances(double[] x, double[] y, double[] z, double[] result, int count)
    {
        for (int i = 0; i < count; i++) result[i] = GetDistance(x[i], y[i], z[i]);
    }

    public double Lipschitz { get { return 1; } }   // exact distance field

    public bool TryGetBounds(out BoundingBox bounds)
    {
        bounds = new BoundingBox(cx - r, cy - r, cz - r, cx + r, cy + r, cz + r);
        return r >= 0;
    }

    public ValueRange Bound(Region region, bool prune, out IHasDistance pruned)
    {
        pruned = this;   // a primitive cannot be simplified
        double near = Distance.BoxDistance(region.ToBoundingBox(), cx, cy, cz);
        double fx = Math.Max(Math.Abs(region.X.Lo - cx), Math.Abs(region.X.Hi - cx));
        double fy = Math.Max(Math.Abs(region.Y.Lo - cy), Math.Abs(region.Y.Hi - cy));
        double fz = Math.Max(Math.Abs(region.Z.Lo - cz), Math.Abs(region.Z.Hi - cz));
        return new ValueRange(near - r, Math.Sqrt(fx * fx + fy * fy + fz * fz) - r);
    }

    public double GetGradient(double x, double y, double z, double eps, out double gx, out double gy, out double gz)
    {
        double dx = x - cx, dy = y - cy, dz = z - cz;
        double l = Math.Sqrt(dx * dx + dy * dy + dz * dz);
        if (l > 0) { gx = dx / l; gy = dy / l; gz = dz / l; } else { gx = gy = gz = 0; }
        return l - r;
    }
}
```

For a primitive, `ILipschitzBound` alone already enables the narrow band (Axolotl derives `d(centre) ± L · radius` for every region). `IIntervalBound` is optional; implement it when it can be tighter, or for fields without a Lipschitz bound.

### Example: a combinator (with pruning)

``` csharp
public class MyMin : IHasDistanceBatch, ILipschitzBound, IHasChildren, IIntervalBound, IHasGradient
{
    readonly IHasDistance a, b;
    public MyMin(IHasDistance a, IHasDistance b) { this.a = a; this.b = b; }

    public double GetDistance(double x, double y, double z) { return Math.Min(a.GetDistance(x, y, z), b.GetDistance(x, y, z)); }

    public void GetDistances(double[] x, double[] y, double[] z, double[] result, int count)
    {
        double[] tmp = Scratch.Rent(count);
        Distance.Evaluate(a, x, y, z, result, count);
        Distance.Evaluate(b, x, y, z, tmp, count);
        for (int i = 0; i < count; i++) result[i] = Math.Min(result[i], tmp[i]);
        Scratch.Return(tmp);
    }

    public double Lipschitz { get { return Distance.MaxLipschitz(a, b); } }
    public IHasDistance[] Children { get { return new[] { a, b }; } }

    public ValueRange Bound(Region region, bool prune, out IHasDistance pruned)
    {
        IHasDistance pa, pb;
        ValueRange ra = Distance.Bound(a, region, prune, out pa);
        ValueRange rb = Distance.Bound(b, region, prune, out pb);
        if (ra.Lo >= rb.Hi) { pruned = pb; return rb; }   // b is the minimum everywhere in the region
        if (rb.Lo >= ra.Hi) { pruned = pa; return ra; }   // a is the minimum everywhere in the region
        bool changed = !ReferenceEquals(pa, a) || !ReferenceEquals(pb, b);
        pruned = prune && changed ? new MyMin(pa, pb) : (IHasDistance)this;
        return ValueRange.Min(ra, rb);
    }

    public double GetGradient(double x, double y, double z, double eps, out double gx, out double gy, out double gz)
    {
        IHasDistance winner = a.GetDistance(x, y, z) <= b.GetDistance(x, y, z) ? a : b;
        return Distance.Gradient(winner, x, y, z, eps, out gx, out gy, out gz);
    }
}
```

### Wrapping Axolotl objects

If your object wraps another distance object (an offset, a custom deformation, a transform), **forward the capabilities**. Otherwise everything inside the wrapper loses them. Use the helpers, which work for operands with and without the interfaces:

``` csharp
public double Lipschitz { get { return Distance.Lipschitz(inner); } }   // adjust if you stretch space

public ValueRange Bound(Region region, bool prune, out IHasDistance pruned)
{
    IHasDistance p;
    ValueRange r = Distance.Bound(inner, region, prune, out p);  // map the region first if you transform space
    pruned = prune && !ReferenceEquals(p, inner) ? new MyOffset(p, offset) : (IHasDistance)this;
    return r - offset;
}
```

For space transformations, map the region into the frame of the wrapped object (`region.Transform(affine)` for affine maps; `Affine` is a fast copy of a Rhino `Transform`), and multiply the gradient by the transposed linear part (`affine.ApplyTranspose`).

### Useful types

- `ValueRange`: interval arithmetic (`+ - * /`, `Min`, `Max`, `Abs`, `Sqr`, `Sqrt`, `Sin`, `Cos`, `Exp`, `Log`, `Tanh`, `PowAbs`, `Hull`, `Entire`).
- `Region`: an axis aligned box of `ValueRange`s (`X`, `Y`, `Z`, `CX`..., `HalfDiagonal`, `Transform`).
- `Dual`: forward mode automatic differentiation (value plus gradient) if you want to write a formula once and get the gradient for free.
- `Frame`: plane coordinates and back (`ToLocal`, `ToWorld`, `VectorToWorld`, `RegionToLocal`, `BoxToWorld`), managed and equivalent to `Transform.ChangeBasis` for Rhino planes.
- `FramedPrimitive`: base class for a primitive defined in a plane. Override `Local(x, y, z)` (distance in plane coordinates) and `LocalBounds`; batching, Lipschitz 1 (override if your function is only a bound with another constant), the world bounding box and interval support (via the Lipschitz bound) come with it.
- `Shape2D` / `IHasBounds2D`: base class for exact 2D profiles in x, y. They work with the Extrude and Revolve components (`Extrude`, `RevolveProfile`), which also derive their 3D bounding box from `IHasBounds2D`.
- `Repetition.LatticeMin`: exact repetition of a bounded object on a lattice (distance to the nearest copy, culled with the bounding box), as used by the Array components.
- `ICoordinateMap` / `Mapped`: a map φ from world to lattice space (`Map` for doubles and for `Dual`, `Bound` for a region plus the range of its stretch). `new Mapped(d, map, Mapped.Correction.LocalStretch)` evaluates `d(φ(x))` divided by the local stretch, which keeps region bounds exact. `CoordinateMaps.Chain(maps)` composes maps. Implementations: `CylindricalMap`, `SphericalMap`, `GradedMap`, `SurfaceShellMap`, `TwoSurfaceMap`, `TubeMap`.
- `CurveFrames`: rotation-minimising frames along a rail (double reflection), with `Local(x, y, z, out lx, out ly, out s)` for profile coordinates and arc length. Used by `SweepProfile` and `TubeMap`.
- `SegmentTree` / `TriangleTree`: managed bounding volume trees for nearest points on segments and triangles; `TriangleTree.WindingNumber` is the fast winding number (Barill et al. 2018). Both are immutable after construction and safe to query from many threads.
- `Formula`: a distance object from a compiled `Func<double, double, double, double>` (what the Expression component builds from `sin(x) + cos(y)`). It has no bounds, so trees containing it are sampled densely.

## 4. Evaluating Axolotl objects in your own components

Calling `GetDistance` point by point keeps working, but bypasses the engine. Use these instead:

| Task | API |
|------------------------------------|------------------------------------|
| values on a grid (parallel, batched, pruned, optional narrow band) | `GridSampler.Sample(d, GridSpec.FromBounds(box, nx, ny, nz), new SampleOptions { NarrowBand = true, Iso = iso }, out stats)` |
| values near the surface only (memory grows with the surface, for very fine grids) | `GridSampler.SampleSparse(d, grid, new SampleOptions { NarrowBand = true, Iso = iso }, maxPoints, out stats)` returns a `SparseGrid` |
| values at arbitrary points (parallel, batched) | `GridSampler.SamplePoints(d, points, null)` |
| a batch of points | `Distance.Evaluate(d, xs, ys, zs, result, count)` |
| value and gradient | `Distance.Gradient(d, x, y, z, eps, out gx, out gy, out gz)` |
| range over a box, simplified tree for that box | `Distance.Bound(d, region, true, out pruned)` |
| marching cubes on sampled values (welded, parallel) | `MarchingCube.Polygonize(values, grid, iso, refine, parallel, cancel)` |
| sharp-feature / adaptive meshing | `AdaptiveDualContouring.Build(sparseGrid, d, tolerance, manifold, parallel, cancel, out vertices, out faces)` then `MeshAssembly.Build(vertices, faces, refine)` (an overload takes dense `values, grid, iso`) |
| smooth dual contouring / surface nets | `DualMesher.Build(values, grid, iso, d, iterations, clampToCell, manifold, refine, parallel, cancel)` |

`manifold = true` gives a cell crossed by several separate pieces of the surface one vertex per piece (`CellTopology`), so thin walls and near-touching parts give no non-manifold edges. The overloads without the parameter keep the earlier one-vertex-per-cell behaviour.

Note: with `NarrowBand = true`, values far from the isosurface are **bounds**, not exact distances (they only have the correct sign). Use `NarrowBand = false` (default) when you need the exact values everywhere, for example for your own post-processing.

Sampled grids can be passed between components as `GooDistanceGrid` (a `DistanceGrid`: `GridSpec` + `double[]`). The Dense Grid, Blur and Isosurface Distance Field components read and write it.

``` csharp
GridSpec grid = GridSpec.FromBounds(box, n, n, n);
SampleStats stats;
double[] values = GridSampler.Sample(d, grid, new SampleOptions { NarrowBand = true, Iso = 0 }, out stats);
Mesh mesh = MarchingCube.Polygonize(values, grid, 0, true, true, CancellationToken.None);
```

## 5. Grasshopper side: parameters, inputs, geometry, scripting

| Task | API |
|------------------------------------|------------------------------------|
| typed inputs / outputs (hidden from the toolbar, shown in tooltips and to RhinoAI) | `Param_DistanceObject`, `Param_CoordinateMap`, `Param_DistanceGrid`, e.g. `pManager.AddParameter(new Param_DistanceObject(), "Distance Object", "D", "...", GH_ParamAccess.item)` |
| an input that takes a number or a field | `FieldInput.Configure(pManager[pManager.AddGenericParameter(...)], defaultValue)`, then `FieldInput.Get(this, DA, i, out value, out field)` (`field` is null for a plain number) |
| any Rhino / Grasshopper geometry as a distance object | `var c = new GeometryConverter(WrapMode.Auto, tolerance, sign); c.Add(item); ...; IHasDistance d = c.Result();` (`null` if nothing converted; `c.Log` says what each item became) |
| a 2D profile swept along a rail | `new SweepProfile(rail, profile, endProfile, plane, twist)` |
| operator expressions from C# or Python | `Sdf`: `(Sdf.Sphere(10) & Sdf.Box(15, 15, 15, 1)) - c`, `.K(r)` smooths the boolean before it; `Sdf.FromGeometry(...)`, `Sdf.Sweep(...)`, `.F` is the `IHasDistance` |
| text expressions | `SdfExpression` looks up function and method names on `Sdf` by reflection, so a public static or instance method added to `Sdf` is available in the Expression component without further code |

Any Axolotl input also accepts an `Sdf` or a plain `IHasDistance` from a script component (`GooHasDistance.CastFrom`).

Menu choices are saved in `.gh` files as **indices**. Lists such as `TPMS.Names`, `Mapped.Corrections` or `TransferFunction.Names` may only be appended to; inserting or reordering changes what old files produce.

## 6. Versioning

Implementing the new interfaces or calling the APIs above means compiling against Axolotl 2.0, so your plugin then requires that version (or later). Objects that only implement `IHasDistance` keep working with old and new versions.