# src/mcp_llm_bridge/main.py
import os
import asyncio
from dotenv import load_dotenv
from mcp import StdioServerParameters
from mcp_llm_bridge.config import BridgeConfig, LLMConfig
from mcp_llm_bridge.bridge import BridgeManager
import colorlog
import logging

async def main():
    # Load environment variables
    load_dotenv()
    user_input = input("\nEnter your prompt (or 'quit' to exit): ")

    # Get the project root directory (where test.db is located)
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    db_path = os.path.join(project_root, "test.db")
    
    # Configure bridge
    config = BridgeConfig(
        mcp_server_params=StdioServerParameters(
            command="python",
            args=["web_search.py", user_input],
            env=None
        ),
        llm_config=LLMConfig(
            api_key="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",  # Can be any string for local testing
            model="nvidia/llama-3.1-nemotron-ultra-253b-v1",
            base_url="https://integrate.api.nvidia.com/v1"  # Point to your local model's endpoint
        ),
        system_prompt="You are a helpful assistant that can use tools to help answer questions."
    )
    async with BridgeManager(config) as bridge:
        try: 
            response = await bridge.process_message(user_input)
            print(f"\nResponse: {response}")
        except Exception as e:
            logger.error(f"\nError occurred: {e}")


if __name__ == "__main__":
    asyncio.run(main())