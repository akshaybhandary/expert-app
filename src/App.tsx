import './index.css'
import ChatInterface from './components/ChatInterface'
import { ThemeContextProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeContextProvider>
      <ChatInterface />
    </ThemeContextProvider>
  )
}

export default App
