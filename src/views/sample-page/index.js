import "normal.css";
import "App.css";
import Collapse from '@mui/material/Collapse';
import { useEffect, useRef, useState } from "react";
import Avatar from "components/Avatar";
import NewChat from "components/NewChat";
import NavPrompt from "components/NavPrompt";
import Loading from "components/Loading";
import Error from "components/Error";
import BotResponse from "components/BotResponse";
import { BrowserRouter, useLocation } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import { v4 as uuidv4 } from 'uuid';
import { Switch, FormControlLabel } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';




const TimerExample = ({ counter, setCounter }) => {
  useEffect(() => {
    // Start the timer when the component mounts
    const timer = setInterval(() => {
      setCounter((prevCounter) => prevCounter + 1);
    }, 1000); // Update the counter every 1000 milliseconds (1 second)

    // Clean up the timer when the component unmounts
    return () => {
      clearInterval(timer);
    };
  }, []); // Empty dependency array ensures that the effect runs only once (on mount)

  return (
    <div>
      <p>Counter: {counter}</p>
    </div>
  );
};


function SamplePage() {
  const [showMenu, setShowMenu] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [err, setErr] = useState(false);
  const [responseFromAPI, setReponseFromAPI] = useState(false);
  const [waitingForMetadata, setWaitingForMetadata] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timePassed, setTimePassed] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialOrgName = searchParams.get('org') || 'Venti.ai';

  const [orgName, setOrgName] = useState(initialOrgName);
  const [playgroundDescription, setDescription] = useState("Venti.ai is an intelligent AI agent that enables your prospects to ask questions about your product and receive answers that eventually lead to them purchasing your product. Venti.ai replace the need to have a salesperson talk with every lead, and also learns from previous conversation history and improves its results");
  const [isWrapped, setWrapped] = useState(searchParams.get('style') === "true" ? true : false);
  const [admin, setAdmin] = useState(true);
  const chatLogRef = useRef(null);

  const imageNameParameter = searchParams.get('imageName') || 'cute.png';
  const [imageName, setImageName] = useState(imageNameParameter);
  const [metadata, setMetadata] = useState([]);
  const [lastApiCall, setLastApiCall] = useState(null);

  const [sessionId, setSessionId] = useState(searchParams.get('sessionId') || null);
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleAdminModeToggle = (event) => {
    setAdmin(event.target.checked);
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!responseFromAPI) {
      if (inputPrompt.trim() !== "") {
        // Set responseFromAPI to true before making the fetch request
        setReponseFromAPI(true);
        setChatLog([...chatLog, { chatPrompt: inputPrompt }]);
        callAPI();
      }

      async function callAPI() {
        try {
          const response = await fetch("https://4sho3o2nok.execute-api.us-west-2.amazonaws.com/prod/chatgpt", {
            method: "POST",
            crossDomain: true,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: inputPrompt, history: chatLog, "org_name": orgName, "sessionId": sessionId }),
            //body: inputPrompt,//
          });
          const data = await response.json();
          setLastApiCall(Date.now());
          setChatLog([
            ...chatLog,
            {
              chatPrompt: inputPrompt,
              botMessage: data.responseBot,
              botMetadata: data.metadata,
            },
          ]);
          //setMetadata(data.metadata);
          setWaitingForMetadata(true);
          console.log(data.metadata);

          setErr(false);
        } catch (err) {
          setErr(err);
          console.log(err);
        }
        //  Set responseFromAPI back to false after the fetch request is complete
        setReponseFromAPI(false);
      }
    }

    setInputPrompt("");
  };

  async function callToMetadataApi() {
    try {
      const response = await fetch("https://4sho3o2nok.execute-api.us-west-2.amazonaws.com/prod/chatgpt", {
        method: "POST",
        crossDomain: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputPrompt, history: chatLog, "org_name": orgName, "sessionId": sessionId, "query_type": "metadata" }),
        //body: inputPrompt,//
      });



      const data = await response.json();
      /*const updatedChatLog = chatLog.slice(0, -1).concat({
        chatPrompt: inputPrompt,
        botMessage: data.responseBot,
        botMetadata: data.metadata,
      });
      
      setChatLog(updatedChatLog);*/
      setMetadata(data.metadata);
      console.log(data.metadata)
      setErr(false);
    } catch (err) {
      setErr(err);
      console.log(err);
    }
  }

  const performAction = () => {
    console.log(timePassed)
    console.log(chatLog)
    if (lastApiCall) {
      const currentTime = Date.now();
      const timeDifference = currentTime - lastApiCall;
      console.log(timeDifference);
    }

    if (chatLog.length > 1 && chatLog[chatLog.length - 1].botMetadata != null && lastApiCall && Date.now() - lastApiCall > 45000) {
      console.log("here")
      console.log(chatLog)
      console.log(chatLog[chatLog.length - 1])
      console.log(metadata)
      var nextMessage = metadata[metadata.length - 1]


      const splitStr = nextMessage.split(':');

      // Check if there is a second element after the split
      if (splitStr.length > 1) {
        // Return the second element (substring after the colon)
        nextMessage = splitStr[1].trim();
      }
      const finalResult = nextMessage.replaceAll("\"", '').replaceAll("7. ", "");

      console.log(finalResult);

      setChatLog([...chatLog, { chatPrompt: "", botMessage: finalResult }]);
    }
  };

  useEffect(() => {

    if (sessionId === null) {
      const uniqueId = uuidv4();
      console.log(uniqueId);
      setSessionId(uniqueId);
      console.log(sessionId)
    }
    const timer = setInterval(performAction, 10000);


    if (chatLogRef.current) {
      chatLogRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    if (orgName === "Totango") {
      setDescription("Totango is the industry's only Composable Customer Success platform, flexible and scalable to meet your business needs so you can drive customer retention, renewal, and expansion.")
    }

    if (orgName === "Iguazio") {
      setDescription("The Iguazio MLOps Platform transforms AI projects into real-world business outcomes. Accelerate and scale development, deployment and management of your AI applications with end-to-end automation of machine (and deep) learning pipelines.")
    }

    if (orgName === "WireMock") {
      setDescription("WireMock is an open-source tool that allows developers and QA teams to create and simulate HTTP-based APIs.")
    }
    if (orgName === "Sentinelone") {
      setDescription("SentinelOne is an endpoint security platform that provides advanced threat prevention, detection, response, and remediation capabilities. It uses artificial intelligence and machine learning to identify and block malware, ransomware, and other cyber threats in real-time.")
    }
    if (orgName === "Digma.ai") {
      setDescription("Digma is a Continuous Feedback platform that provides actionable insights about your code as you write it by translating existing observability into practical insights developers can use to design and measure their work.")
    }
    if (orgName === "Anjuna.ai") {
      setDescription("Anjuna Confidential Computing software provides a high-trust environment for workloads and data in hybrid-cloud environments.")
    }

    if (waitingForMetadata) {
      callToMetadataApi();
      setWaitingForMetadata(false);
    }



    return () => { clearTimeout(timer); };
  }, [chatLog]);



  const content =

    <div className="App">
      <div className="navItems"  >

        <Card sx={{ minWidth: 275, maxWidth: '500px', p: 2, border: '2px dashed rgb(229, 246, 253)', borderRadius: "4px" }} variant="outlined" Collapse>
          <CardContent >



            <Typography sx={{ fontSize: 22 }} color="primary.main" gutterBottom>
              This is {orgName} playground
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              This virtual assistant instance has been trained on {orgName}'s data.
            </Typography>

            <Typography color="text.secondary" gutterBottom>
              {playgroundDescription}
            </Typography>
          </CardContent>

        </Card>

        <Card sx={{ minWidth: 275, maxWidth: '500px', border: '2px dashed rgb(229, 246, 253)', borderRadius: "4px" }} variant="outlined">
          <CardContent >
            <Typography sx={{ fontSize: 22, marginBottom: 2 }} color="primary.main" gutterBottom>
              Frequently Asked Questions
            </Typography>
            <MuiAlert icon={false} sx={{ margin: 1 }} alignItems="left" elevation={6} severity='info'>What does {orgName} do?</MuiAlert>
            <MuiAlert icon={false} sx={{ margin: 1 }} alignItems="left" elevation={6} severity='info'>What is {orgName} pricing?</MuiAlert>
            <MuiAlert icon={false} sx={{ margin: 1 }} alignItems="left" elevation={6} severity='info'>I’m trying to connect to salesforce, will you be able to help me? and how?</MuiAlert>
            {/* <MuiAlert icon={false}  sx={{ margin: 1 }} alignItems="left" elevation={6} severity='info'>Can you draft an email to my manager explaining why {orgName} is a good fit for us</MuiAlert> */}

          </CardContent>

        </Card>

        <Card sx={{ minWidth: 275, maxWidth: '500px', p: 2, border: '2px dashed rgb(229, 246, 253)', borderRadius: "4px" }} variant="outlined" Collapse>
          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={admin}
                  onChange={handleAdminModeToggle}
                  color="primary"
                />
              }
              label={'Admin Mode'}
            />
          </CardContent>

        </Card>



        {/* <p>What does {orgName} do?</p> 
<p>How much does {orgName} cost?</p>
<p>I’m trying to connect to salesforce, will you be able to help me? and how?</p>  */}


      </div>
      {/* <header>
        <div className="menu">
          <button onClick={() => setShowMenu(true)}>
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="#d9d9e3"
              strokeLinecap="round"
            >
              <path d="M21 18H3M21 12H3M21 6H3" />
            </svg>
          </button>
        </div>
        <h1>venti</h1>
      </header> */}
      {showMenu && (
        <nav>
          <div className="navItems">
            <NewChat setChatLog={setChatLog} setShowMenu={setShowMenu} />
            {chatLog.map(
              (chat, idx) =>
                chat.botMessage && (
                  <NavPrompt
                    chatPrompt={chat.chatPrompt}
                    key={idx}
                    setShowMenu={setShowMenu}
                  />
                )
            )}
          </div>
          <div className="navCloseIcon">
            <svg
              fill="#fff"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              xmlSpace="preserve"
              stroke="#fff"
              width={42}
              height={42}
              onClick={() => setShowMenu(false)}
            >
              <path d="m53.691 50.609 13.467-13.467a2 2 0 1 0-2.828-2.828L50.863 47.781 37.398 34.314a2 2 0 1 0-2.828 2.828l13.465 13.467-14.293 14.293a2 2 0 1 0 2.828 2.828l14.293-14.293L65.156 67.73c.391.391.902.586 1.414.586s1.023-.195 1.414-.586a2 2 0 0 0 0-2.828L53.691 50.609z" />
            </svg>
          </div>
        </nav>
      )}


      <section className="chatBox">
        {/* <div className="chatHeaderWrapper">
      
        <p> <img src="agent_dalle.png"  width={50}
                height={55} /> Jacob</p>
        <p>Active in the last 15 minutes</p>
        </div> */}
        {chatLog.length > 0 ? (
          <div className="chatLogWrapper">
            {chatLog.length > 0 &&
              chatLog.map((chat, idx) => (
                <div
                  className="chatLog"
                  key={idx}
                  ref={chatLogRef}
                  id={`navPrompt-${chat.chatPrompt.replace(
                    /[^a-zA-Z0-9]/g,
                    "-"
                  )}`}
                >
                  {chat.chatPrompt === "" ? (<div></div>) : (
                    <div className="chatPromptMainContainer">
                      <div className="chatPromptWrapper">
                        {/* <Avatar bg="#5437DB" className="userSVG">
                        <svg
                          stroke="currentColor"
                          fill="none"
                          strokeWidth={1.9}
                          viewBox="0 0 24 24"
                          // strokeLinecap="round"
                          // strokeLinejoin="round"
                          className="h-6 w-6"
                          height={55}
                          width={50}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx={12} cy={7} r={4} />
                        </svg>
                      </Avatar> */}

                        <div id="chatPrompt">{chat.chatPrompt}</div>
                      </div>
                    </div>
                  )}

                  <div className="botMessageMainContainer">
                    <div className="botMessageWrapper">
                      <img src={imageName} width={50} className="userImage" alt="Agent"
                        height={55} />
                      {chat.botMessage ? (
                        <div id="botMessage">
                          <BotResponse
                            response={chat.botMessage}
                            chatLogRef={chatLogRef}
                            chatLog={chat.chatPrompt}
                            admin={admin}
                          />
                        </div>
                      ) : err ? (
                        <Error err={err} />
                      ) : (
                        <Loading />
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="chatLogWrapper">
            <div
              className="chatLog">
              <div className="botMessageMainContainer">
                <div className="botMessageWrapper" >
                  <img src={imageName} width={50} className="userImage" alt="Agent"
                    height={55} />


                  <div id="botMessage"   >
                    <BotResponse
                      response={`Hi! Want to chat about ${orgName}? I'm here to help you find your way. How may I help?`}
                    />

                  </div>


                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="inputPromptWrapper" >
            <input
              name="inputPrompt"
              id=""
              className="inputPrompttTextarea"
              type="textarea"
              placeholder="Write a message..."
              rows="1"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}



            ></input>

            <button className="inputButton" > <img src="send.png" height="50px" alt="send"></img></button>

          </div>
        </form>
      </section>

    </div>

  const centeredStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    //  height: '80vw', // 100% of the viewport height
    //  width: '100vw', // 100% of the viewport width
    border: '1px solid hsl(0deg 0% 100% / 20%)',


    background: /*'radial-gradient(circle at 10% 20%, rgb(99, 55, 255) 0%, rgb(39, 170, 255) 90%)'*/'white',


    padding: '10px',

  };
  return <div >  <MainCard title="Playground"> <div style={centeredStyle}>{content}


    {admin && (
      <Card sx={{ minWidth: 275, maxWidth: '500px' }} variant="outlined" display="flex" alignItems="flex-start">

        <Button size="small" onClick={handleExpandClick}>
          {expanded ? 'Hide Analytics' : 'Show Analytics'}
        </Button>


        <Collapse in={expanded} timeout="auto" unmountOnExit>

          <Card sx={{ minWidth: 275, maxWidth: '500px' }} variant="outlined">
            <CardContent >
              <Typography sx={{ fontSize: 24 }} color="primary.main" gutterBottom>
                Target Function
              </Typography>
              {metadata.map((item, index) => (
                <div key={index}>
                  {index <= 1 && (
                    <MuiAlert
                      alignItems="left"
                      elevation={6}
                      severity={
                        !item.includes("No") && !item.includes("no") &&
                          !item.includes("Unknown") &&
                          !item.includes("follow-up")
                          ? "success"
                          : "info"
                      }
                    >
                      {item}
                    </MuiAlert>
                  )}
                </div>
              ))}

            </CardContent>
          </Card>
          <Card sx={{ minWidth: 275, maxWidth: '500px' }} variant="outlined">

            <CardContent >
              <Typography sx={{ fontSize: 24 }} color="primary.main" gutterBottom>
                Qualification progress
              </Typography>

              {metadata.map((item, index) => (
                <div key={index}>
                  {index > 1 && index <= 3 && (
                    <MuiAlert
                      alignItems="left"
                      elevation={6}
                      severity={
                        !item.includes("No") && !item.includes("no") &&
                          !item.includes("Unknown") &&
                          !item.includes("follow-up")
                          ? "success"
                          : "info"
                      }
                    >
                      {item}
                    </MuiAlert>
                  )}
                </div>
              ))}

            </CardContent>
          </Card>


          <Card sx={{ minWidth: 275, maxWidth: '500px' }} variant="outlined">
            <CardContent >
              <Typography sx={{ fontSize: 24 }} color="primary.main" gutterBottom>
                Interaction Analysis
              </Typography>
              {metadata.map((item, index) => (
                <div key={index}>
                  {index > 4 && (
                    <MuiAlert
                      alignItems="left"
                      elevation={6}
                      severity={
                        !item.includes("No") && !item.includes("no") &&
                          !item.includes("Unknown") &&
                          !item.includes("follow-up")
                          ? "success"
                          : "info"
                      }
                    >
                      {item}
                    </MuiAlert>
                  )}
                </div>
              ))}


              <Typography marginTop={2} sx={{ fontSize: 22 }} color="primary.main" gutterBottom>
                Lead score
              </Typography>
              <Rating name="half-rating" defaultValue={2.5} precision={0.5} />
            </CardContent>
            <CardActions>
              <Button size="small">Learn More</Button>
            </CardActions>
          </Card>
        </Collapse>
      </Card>)}

  </div> </MainCard></div>;;
}
export default SamplePage;
