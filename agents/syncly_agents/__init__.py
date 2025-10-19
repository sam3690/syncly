"""Syncly agent pipeline package."""

from importlib import metadata

__all__ = ["__version__"]


def __version__() -> str:
    try:
        return metadata.version("agents")
    except metadata.PackageNotFoundError:  # pragma: no cover
        return "0.0.0"
