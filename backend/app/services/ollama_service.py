import httpx

from app.core.config import settings


class OllamaService:
    def __init__(self) -> None:
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.model = settings.ollama_model
        self.api_key = settings.ollama_api_key

    async def generate(
        self,
        prompt: str,
        format: str | dict | None = None,
    ) -> str:

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "stream": False,
        }

        if format is not None:
            payload["format"] = format

        headers = {
            "Content-Type": "application/json",
        }

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                headers=headers,
            )

            response.raise_for_status()

            data = response.json()

            return data["message"]["content"]


ollama = OllamaService()