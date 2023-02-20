import Head from 'next/head'
import { useState, useEffect } from 'react';
import dynamic from "next/dynamic";

export default function Home() {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    async function fetchServers() {
      const response = await fetch('http://localhost:3003/servers');
      const data = await response.json();
      setServers(data.servers);
    }
    fetchServers();
  }, []);

  function convertHtmlToDiscord(html) {
    const convertedText = html.replace(/<br>/gi, '\n')
                              .replace(/&nbsp;/gi, ' ')
                              .replace(/<b>(.?)<\/b>/gi, '$1*')
                              .replace(/<strong>(.?)<\/strong>/gi, '$1*')
                              .replace(/<em>(.?)<\/em>/gi, '$1*')
                              .replace(/<i>(.?)<\/i>/gi, '$1*')
                              .replace(/<u>(.*?)<\/u>/gi, '_$1_')
                              .replace(/<strike>(.*?)<\/strike>/gi, '~$1~')
                              .replace(/<s>(.*?)<\/s>/gi, '~$1~')
                              .replace(/<code>(.*?)<\/code>/gi, '`$1`')
                              .replace(/<p>(.*?)<\/p>/gi, '$1')
                              .replace(/<img src="(.?)"(.?)>/gi, '')
                              .replace(/<pre>(.*?)<\/pre>/gi, '$1');
    return convertedText.trim();
  }

  function sendToServer(id) {
    const payload = JSON.stringify({ message: convertHtmlToDiscord(editorData) });
    fetch(`http://localhost:3003/send-server/${id}`, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          console.log('Message sent to server');
        } else {
          console.log('Failed to send message to server');
        }
      })
      .catch(error => {
        console.log('Error sending message to server:', error);
      });
  }

  const [editorData, setEditorData] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  function handleEditorDataChange (event) {    
    setEditorData(event);
  };

  const handlePreviewButtonClick = () => {
    const html = convertHtmlToDiscord(editorData);
    setPreviewHtml(html);
  };

  const handleSendAllButtonClick = () => {
    const payload = JSON.stringify({ message: convertHtmlToDiscord(editorData) });
    fetch('http://localhost:3003/send-all', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          console.log('Message sent to all servers');
        } else {
          console.log('Failed to send message to all servers');
        }
      })
      .catch(error => {
        console.log('Error sending message to all servers:', error);
      });
  };

  
  const Editor = dynamic(() => import("./MyEditor"), { ssr: false });
  const MyComp = () => {
    return (
      <Editor  
        value={editorData}
        onChange={(v) => handleEditorDataChange(v)}
      />
  )};

  return (
    <>
      <Head>
        <title>Discord Announcement</title>
      </Head>
      <h1>Discord Announcement</h1>

      <div id="server-list">
        {servers.map(server => (
          <button key={server.id} onClick={() => sendToServer(server.id)}>
            Send to {server.name}
          </button>
        ))}
      </div>
      <MyComp />

      <button onClick={handlePreviewButtonClick}>Preview</button>
      <button onClick={handleSendAllButtonClick}>Send to All Servers</button>

      <div dangerouslySetInnerHTML={{ __html: previewHtml }}></div>
      <div id="send-container"></div>
    </>
  )
}
