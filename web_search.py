from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP
from tavily import TavilyClient
from dotenv import load_dotenv
import os
import json
load_dotenv()
# 初始化 FastMCP 服务器
mcp = FastMCP("web_search")

@mcp.tool()
async def web_search(query: str) -> str:
    """执行网络搜索并返回相关结果

    使用Tavily API进行高质量的互联网搜索，返回最相关的前5个结果。
    这个工具可以帮助获取最新的信息或回答需要实时数据的问题。

    Args:
        query: 搜索查询字符串

    Returns:
        str: 包含搜索结果的格式化字符串
    """
    tavily_client = TavilyClient(api_key="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")
    #response = tavily_client.search(query,max_results=5)
    response = tavily_client.search(
        query,
        max_results=5,
        search_depth="advanced",
        include_answer="advanced"
    )
    #输出是一个字典，需要进行格式化成字符串
    response = json.dumps(response,indent=4)
    return response

if __name__ == "__main__":
    # 初始化并运行服务器
    mcp.run(transport='stdio')