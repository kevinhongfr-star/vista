import { callDeepSeek, callDeepSeekJSON } from "./lib/deepseek"

async function testDeepSeek() {
  console.log("Testing DeepSeek API...")
  
  try {
    const result = await callDeepSeek("Say hello in 3 words.")
    console.log("Text response:", result)
  } catch (e) {
    console.error("Text test failed:", e)
  }

  try {
    const jsonResult = await callDeepSeekJSON<{ greeting: string }>(
      'Output JSON: {"greeting": "hello"}'
    )
    console.log("JSON response:", jsonResult)
  } catch (e) {
    console.error("JSON test failed:", e)
  }
}

testDeepSeek()
