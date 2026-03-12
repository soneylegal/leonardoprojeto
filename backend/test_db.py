import asyncio
from app.core.database import engine, Base
from sqlalchemy import text

async def test_db():
    try:
        async with engine.begin() as conn:
            # Check connection
            result = await conn.execute(text("SELECT version();"))
            version = result.scalar()
            print(f"✅ Conexão com banco de dados bem sucedida!")
            print(f"Versão: {version}")
            
            # Create tables
            print("Criando tabelas...")
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Tabelas criadas/verificadas com sucesso!")
            
    except Exception as e:
        print(f"❌ Erro ao conectar com o banco de dados: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_db())
