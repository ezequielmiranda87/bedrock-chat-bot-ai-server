import AWS from 'aws-sdk' // Import the AWS SDK
import { ChatPromptTemplate } from 'langchain/prompts'
import { BedrockChat } from 'langchain/chat_models/bedrock'
import { ConversationChain } from 'langchain/chains'
import { BufferMemory } from 'langchain/memory'
import express from 'express'
import cors from 'cors'

const SERVER_PORT = process.env.PORT || 3001

const app = express()
app.use(express.json())
app.use(cors())

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
})

const model = new BedrockChat({
  model: 'anthropic.claude-v2',
  region: 'us-west-2'
})

const memory = new BufferMemory()

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    "Welcome to YourInteriorDesignBot! I'm here to assist you in finding the perfect furniture for your apartment. To get started, I have a few questions to help me understand your needs better."
  ],
  [
    'system',
    '1. What is the size of your apartment? (e.g., number of rooms, square footage)\n2. Can you describe the existing color scheme or any specific themes in your apartment?\n3. Are there any particular styles or furniture themes you prefer?\n4. Do you have specific furniture pieces in mind, or would you like suggestions across various categories?'
  ],
  ['human', '{text}'],
  [
    'system',
    'Great! Based on your input, here are personalized furniture and appliance recommendations for each space in your apartment:\n\n**Living Room:** [List of recommended items]\n**Bedroom:** [List of recommended items]\n**Kitchen:** [List of recommended appliances]\n**Bathroom:** [List of recommended items]'
  ]
])

const chain = new ConversationChain({
  prompt: chatPrompt,
  llm: model,
  memory: memory,
  maxTokens: 100
})

app.get('/hi', async (req, res) => {
  res.send("Hiii")
})


app.post('/chat', async (req, res) => {
  const input = req.body.input
  const { response } = await chain.call({ text: input })
  console.log(response)
  res.json(response)
})



app.listen(SERVER_PORT, () => {
  console.log(`Server running on port: ${SERVER_PORT}`)
})
