import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def f():
    print("INSIDE F WITH SELECTOR EVENT LOOP WORKS!", flush=True)

if __name__ == "__main__":
    asyncio.run(f())
