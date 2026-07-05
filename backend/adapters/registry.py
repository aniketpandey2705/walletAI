import importlib
import pkgutil
import inspect
from typing import List, Dict, Any, Type, Optional
from adapters.base import BankAdapter
import adapters.banks

# Cache of discovered adapters
_adapters: List[BankAdapter] = []

def _load_adapters():
    """Dynamically load all adapter classes from the adapters.banks package."""
    global _adapters
    if _adapters:
        return
        
    for _, module_name, is_pkg in pkgutil.iter_modules(adapters.banks.__path__):
        if not is_pkg:
            module = importlib.import_module(f"adapters.banks.{module_name}")
            for name, obj in inspect.getmembers(module):
                if inspect.isclass(obj) and issubclass(obj, BankAdapter) and obj != BankAdapter:
                    # Instantiate the adapter and add to registry
                    _adapters.append(obj())

def detect_adapter(docling_doc: Dict[str, Any]) -> Optional[BankAdapter]:
    """
    Finds the first adapter that claims it can handle the given document.
    """
    _load_adapters()
    for adapter in _adapters:
        if adapter.detect(docling_doc):
            return adapter
    return None

def get_adapter_by_slug(slug: str) -> Optional[BankAdapter]:
    """Gets an adapter by its explicit slug."""
    _load_adapters()
    for adapter in _adapters:
        if adapter.slug == slug:
            return adapter
    return None
