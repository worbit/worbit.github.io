# Rosetta Form – languages, description status and families

Source: Bernhard, M. (2024). *Languages of Geometry.* DMS 2024, Springer, pp. 205–219 (`978-3-031-68275-9_17.pdf`).

All apps embedded as iframes in [`rosettaform/index.html`](../rosettaform/index.html), in that order.

- **Families (c)** for languages described in the paper are copied from the paper's appendix.
- For languages *missing in paper*, the families are **suggestions** (in *italics*).
- **Bold** names are proposed new families (defined below the table).

| Language | Status | c) Families |
|---|---|---|
| Aggregation | description added from paper (was already there) | Empty, Field, Approximation |
| Angle | description added from paper (was already there) | Empty, Typology |
| Barycentric | missing in paper | *Empty, Field, **Interpolation*** |
| BIM | missing in paper (three.js/IFC page, no p5 sketch – tooltip pattern does not apply) | *3D, Typology, Empty* |
| Boolean | description added from paper | Empty, Typology, Field, Fluid Topology |
| Cellular | missing in paper (mentioned as the "23rd language being finalized"; placeholder tooltip in sketch) | *Field, Fluid Topology, **Process**, **Discrete*** |
| Complex | missing in paper (mentioned as "waiting in line") | *Empty, Trigonometry, **Non-Euclidean*** |
| Cylinder | description added from paper | Empty, Field, 3D |
| DistanceFunction | description added from paper | Field, Fluid Topology, 3D ¹ |
| Dissect | missing in paper | *Empty, Typology, **Discrete**, **Interpolation*** |
| EdgeMatching | missing in paper | *Typology, Approximation, Uncertainty, **Discrete**, **Process*** |
| Epicycle | description added from paper | Empty, Trigonometry, Approximation |
| Fourier2D | description added from paper | Field, Approximation, Trigonometry, Fluid Topology |
| Hyperbolic | description added from paper | Empty, 3D |
| LLM | description added from paper | Empty, Uncertainty |
| MinkowskySum | missing in paper | *Empty, Typology, Fluid Topology* |
| NURBS | description added from paper | Empty, Typology |
| Offset | description added from paper | Empty, Typology |
| OptimalTransport | missing in paper | *Field, Uncertainty, Fluid Topology, **Interpolation*** |
| Parallelogram | description added from paper | Empty, Typology |
| Physics | missing in paper (mentioned as "form-force"?) | *Empty, Uncertainty, **Process**, **Discrete*** |
| Poincare | missing in paper | *Empty, Trigonometry, **Non-Euclidean*** |
| Point | description added from paper | Empty, Typology |
| Pointcloud | description added from paper | Empty, Uncertainty, Fluid Topology |
| Polar | description added from paper | Empty, Trigonometry |
| Probability | description added from paper | Field, Approximation, Uncertainty |
| Projection | description added from paper | Empty, 3D |
| Rectangle | missing in paper | *Empty, Typology* |
| SmoothConvex | missing in paper (placeholder tooltip in sketch) | *Field, Approximation, Uncertainty* |
| Sphere | description added from paper | Empty, 3D, Trigonometry |
| Subdivision | missing in paper (mentioned as "waiting in line") | *Empty, Typology, **Process**, **Discrete*** |
| Superellipse | description added from paper | Empty, Approximation |
| Tessellation | description added from paper | Field, Fluid Topology, 3D |
| Tile | description added from paper | Empty, Typology, Approximation |
| Turtle | description added from paper | Empty, Typology |
| VAE | missing in paper | *Field, Uncertainty, Approximation, **Interpolation*** |
| WaveFunctionCollapse | missing in paper | *Uncertainty, Fluid Topology, **Process**, **Discrete*** |

¹ The paper prints "Fluid *Typology*" for DistanceFunction; this is a typo for Fluid Topology (cf. Fig. 3), corrected in the tooltip.

**Totals:** 37 apps – 22 described in the paper (tooltip now present in all 22), 15 missing in paper.

## Rationale for the suggestions (languages missing in paper)

- **Barycentric** – each pixel is located by barycentric coordinates in a triangulated mesh that is morphed (rectangle → pentagon); a field evaluated over an explicit mesh.
- **BIM** – the form is a semantic building element (IFC) in a 3D model; the epitome of typological, object-based CAD.
- **Cellular** – a discrete grid (field) whose state is the outcome of local neighbourhood rules; topology emerges.
- **Complex** – points as complex numbers transformed by a Möbius map; rotation/scaling as multiplication, and Möbius maps are the isometries of the hyperbolic plane.
- **Dissect** – the form is cut into discrete pieces that are moved apart (dissection / exploded view; cf. Dudeney's hinged dissections).
- **EdgeMatching** – rotatable decorative tiles with matching edge conditions, randomisable; the form arises from the combinatorics of discrete pieces.
- **MinkowskySum** – sum of two point sets followed by a convex hull; a generalised offset (cf. Offset, Boolean), topology recomputed.
- **OptimalTransport** – entropic transport between two density fields (rectangle → ring); the genus changes along the way.
- **Physics** – the form is one block in a box stack whose final position is the result of a rigid body simulation; small changes cascade.
- **Poincare** – the Poincaré disc model of the hyperbolic plane; edges are geodesics (circle arcs orthogonal to the boundary).
- **Rectangle** – the CAD primitive `rect(x, y, w, h)`: the most typological, most constrained language.
- **SmoothConvex** – intersection of half-planes evaluated per pixel with a soft-max and a sigmoid: a smooth, fuzzy field version of Boolean/Parallelogram.
- **Subdivision** – the form is one cell of a recursive (guillotine) subdivision of the canvas, as in plot or floor-plan partitioning.
- **VAE** – the decoder outputs a per-pixel probability of "inside"; the slider walks through a learned latent space between forms.
- **WaveFunctionCollapse** – tiles collapsed under adjacency constraints; the slider controls how many cells are randomised.

## Proposed new families

Each of these connects at least three languages. Paper languages that would also fit are listed in brackets (optional – their paper families were left unchanged in the table).

1. **Process** – The form is not described directly but emerges from iteratively applying rules, constraints or a simulation over time; the same rules can yield different outcomes.
   Cellular, EdgeMatching, Physics, Subdivision, WaveFunctionCollapse (+ Turtle, Aggregation)
2. **Discrete** – The form is assembled from, or decomposed into, a finite set of discrete parts or cells whose combinatorics define the result (discrete architecture, prefabrication, mosaics).
   Cellular, Dissect, EdgeMatching, Physics, Subdivision, WaveFunctionCollapse (+ Tile, Aggregation)
3. **Interpolation** – The form is one state on a continuous path between two or more other forms; the language is defined by how it blends (morphing, transport, latent spaces).
   Barycentric, Dissect, OptimalTransport, VAE (+ Cylinder)
4. **Non-Euclidean** – The form lives in a space where the parallel postulate does not hold (spherical, hyperbolic), so "straight", "right angle" and "rectangle" change meaning. In the paper this is discussed under Angle, Hyperbolic and Sphere but not a family.
   Complex, Poincare (+ Hyperbolic, Sphere, Angle)

A **Learning** family (LLM, VAE) was considered but has only two members so far; it would reach three with e.g. a GAN or diffusion-based language.
