"""Azure OpenAI service wrapper."""

import os
from openai import AzureOpenAI
from typing import List, Dict


def get_client() -> AzureOpenAI:
    return AzureOpenAI(
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_key=os.environ["AZURE_OPENAI_API_KEY"],
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
    )


def chat_completion(messages: List[Dict[str, str]], max_tokens: int = 512, temperature: float = 0.7) -> dict:
    """Call Azure OpenAI chat completion and return the response dict."""
    client = get_client()
    deployment = os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"]

    response = client.chat.completions.create(
        model=deployment,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    return {
        "message": {
            "role": response.choices[0].message.role,
            "content": response.choices[0].message.content,
        },
        "usage": {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
        },
    }
