import { useState } from "react"
import { ItemSuggestion } from "./components/ItemSuggestion"
import { getHistoric, setHistoric } from "./storage/historic"
import { sendMessage } from "./api/openai"
import { ThreeDots } from "react-loader-spinner"

type ProgressType = 'pending' | 'started' | 'done'

type Message = {
  role: 'user' | 'assistant'
  content: string
  subject?: string
}

function App() {
  const [progress, setProgress] = useState<ProgressType>('pending')
  const [textarea, setTextArea] = useState<string>('')
  const [chat, setChat] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  function resetChat(){
    setProgress('pending')
    setChat([])
  }

  async function handleSubmitChat(){
    if (!textarea) {
      return
    }
    
    const message = textarea
    setTextArea('')

    if (progress === 'pending'){
      setHistoric(message)
      setProgress('started')
      
      const prompt = `gere uma pergunta onde simule uma entrevista de 
      emprego sobre ${message}, após gerar a pergunta, 
      enviarei a resposta e você me dará um feedback.
      O feedback precisa ser simples e objetivo e corresponder fielmente a respotas enviada.
      Após o feedback não existirá mais interação.`
      
      const messageGPT: Message = {
        role: 'user',
        content: prompt,
        subject: message
      }

      setChat(text => [...text, messageGPT])
      setLoading(true)
      const questionGPT = await sendMessage([messageGPT])
      setChat(text => [...text, { role: 'assistant', content: questionGPT.content}])
      setLoading(false)
      return
    }

    const responseUser: Message = {
      role: 'user',
      content: message
    }


    setChat(text => [...text, responseUser])
    setLoading(true)
    const feedbackGPT = await sendMessage([...chat, responseUser])
    setChat(text => [...text, { role: 'assistant', content: feedbackGPT.content }])
    setLoading(false)
    setProgress('done')
  }

  return (
    < div className = "container" >
        <div className="sidebar">
            <details open className="suggestion">
                <summary>Tópicos sugeridos</summary>
                <ItemSuggestion title="HTML" onClick={() => setTextArea('HTML')}/>
                <ItemSuggestion title="CSS" onClick={() => setTextArea('CSS')}/>
                <ItemSuggestion title="JavaScript" onClick={() => setTextArea('JavaScript')}/>
                <ItemSuggestion title="TypeScript" onClick={() => setTextArea('TypeScript')}/>
            </details>

            <details open className="historic">
                <summary>Histórico</summary>
                {
                  getHistoric().map(item => (
                    <ItemSuggestion title={item} onClick={() => setTextArea(item)}/>
                  ))
                }
      
            </details>
        </div>


        <div className="content">
            {progress === 'pending' && (
                <div className="box-home">
                  <span>Olá, eu sou o</span>
                  <h1>CodeMentor<span>.me</span></h1>
                  <p>Estou aqui para apoiar seu aprendizado!</p>
                  <p>Selecione um dos tópicos de estudo ao lado 
                  ou insira um tema específico que deseja explorar.</p>
                  <p>Vamos iniciar uma jornada de estudos para você.
                  </p>
                </div>
              )}

              {progress !== 'pending' && (
                <div className="box-chat">
                  {chat[0] && (
                    <h1>Você está estudando sobre <span>{chat[0].subject}</span></h1>
                  )}

                  {chat[1] && (
                    <div className="question">
                      <h2><img src="assets/question.svg"/> Pergunta</h2>
                      <p>{chat[1].content}</p>
                    </div>
                  )}

                  {chat[2] && (
                    <div className="answer">
                        <h2>Sua Resposta</h2>
                        <p>{chat[2].content}</p>
                    </div>
                  )}

                  {chat[3] && (
                    <div className="feedback">
                        <h2>Feedback CodeMentor<span>.me</span></h2>
                        <p>{chat[3].content}</p>
                        <div className="actions">
                            <button onClick={resetChat}>Estudar novo tópico</button>
                        </div>
                    </div>
                  )}

                { 
                loading && (
                  <ThreeDots
                  visible={true}
                  height="30"
                  width="60"
                  color="#0385b1"
                  radius="9"
                  ariaLabel="three-dots-loading"
                  wrapperStyle={{ margin: '30px auto'}}

                  />
                )
                }
                
                </div>
              )}


              {progress !== 'done' && (
                  <div className="box-input">
                      <textarea value={textarea} onChange={element => setTextArea(element.target.value)} 
                      placeholder={
                      progress === 'started' ? "Insira sua resposta..." : "Insira o tema que deseja estudar..."
                      } 
                      />
                      <button onClick={handleSubmitChat}>{progress === 'pending' ? 'Enviar Pergunta' : 'Enviar Resposta'}</button>
                  </div>
              )}

            <footer className="box-footer">
                <p>CodeMentor<span>.me</span></p>
            </footer>
        </div>

    </div >
  )
}

export default App
