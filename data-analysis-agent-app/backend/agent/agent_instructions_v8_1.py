import importlib.util
import pathlib

# The authoritative file lives two levels above data-analysis-agent-app/
_src = pathlib.Path(__file__).parent.parent.parent.parent / "agent_instructions_v8_1.py"
_spec = importlib.util.spec_from_file_location("_agent_instructions_src", _src)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

SYSTEM_PROMPT = _mod.SYSTEM_PROMPT
