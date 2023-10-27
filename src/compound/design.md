# Compound - A New UI Library

## Goals

* Based on compounding modular components.
* Capable of running inside and outside of a ContentEditable.
* Based on `model` library.

## Types of Components

### Primitive Component

A primitive component manages interaction with the DOM itself.

### Compound Component

A compound component just describes which other components it
consists of, and how the models of these other components
are derived from its own model.