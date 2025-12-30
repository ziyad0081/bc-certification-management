from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Blockchain
    blockchain_rpc_url: str
    chain_id: int

    # Frontend
    frontend_url: str

    # Private Key
    private_key: str

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="forbid"   # strict & safe
    )

settings = Settings()
