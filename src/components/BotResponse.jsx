import React, { useEffect } from "react";
import { useState } from "react";
import PropTypes from "prop-types";
import { InlineWidget } from "react-calendly";
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,TextField, Snackbar } from '@mui/material';
import { Alert } from '@mui/material';






const YoutubeEmbed = ({ embedUrl }) => (
  <div className="video-responsive">
    <iframe
      maxwidth="300"
      maxheight="200"
      src={embedUrl}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
    />
  </div>
);

YoutubeEmbed.propTypes = {
  embedUrl: PropTypes.string.isRequired
};

const extractUrl = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)(?<!\.)\b/g;
  return text.match(urlRegex);
};

const BotResponse = ({ response, chatLogRef,chatLog,admin }) => {
  const [botResoponse, setBotResponse] = useState("");
  const [isPrinting, setIsPrinting] = useState(true);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [urlLinks, setUrlLinks] = useState([]);
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // State to store the updated text
  const [updatedText, setUpdatedText] = useState(botResoponse);

  // Handler function to open/close dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    callApi();
    handleClose();
    handleSnackbarOpen();

  };

  // Function to handle the TextField value change
  const handleTextChange = (event) => {
    setUpdatedText(event.target.value);
  };

  // Asynchronous function to call the API
  const callApi = async () => {
    try {
      const response = await fetch('https://dummy/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "updatedFeedback": updatedText, "original" : botResoponse,"history": chatLog, query_type: "feedback" }),
      });

      if (response.ok) {
        console.log('Successfully updated');
      } else {
        console.error('Failed to update');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  // Handler function to open/close Snackbar
  const handleSnackbarOpen = () => {
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const createMarkup = (text) => {
    if (urlLinks.length > 0) {
      let linkedText = text;
      urlLinks.forEach((url) => {
        linkedText = linkedText.replace(
          url,
          `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`
        );
      });
      return { __html: linkedText };
    } else {
      return { __html: text };
    }
  };

  useEffect(() => {
    let index = 1;
    const urlExtracted = extractUrl(response);
    console.log(urlExtracted);
    setUrlLinks(urlExtracted || []);
    let msg = setInterval(() => {
      if (response !== " - The Ultimate AI Assistant") {
        setIsButtonVisible(true);
      }
      if (!isPrinting) {
        clearInterval(msg);
        return;
      }
      setBotResponse(response.slice(0, index));
      if (index >= response.length) {
        clearInterval(msg);
        setIsButtonVisible(false);
      }
      index++;

      if (chatLogRef !== undefined) {
        chatLogRef.current.scrollIntoView({
          behavior: "smooth"
        });
      }
    }, 20);
    return () => clearInterval(msg);
  }, [chatLogRef, response, isPrinting]);

  const stopPrinting = () => {
    setIsPrinting(!isPrinting);
    console.log("stopped");
  };

  

  
  return (
    <>
      <pre>
      
        <span dangerouslySetInnerHTML={createMarkup(botResoponse)} />
        {botResoponse === response ? "" : "|"}
        {urlLinks.map((url) => {
          if (url.includes("youtube") && url.includes("embed")) {
            return <YoutubeEmbed key={url} embedUrl={url} />;
          } else if (url.includes("calendly")) {
            return (
              <div key={url}>
                <InlineWidget
                  url={url}
                  styles={{
                    height: "800px",
                    minWidth: "320px",
                    backgroundColor: "#f2f2f2",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "4px",
                    border: "1px solid #e6e6e6",
                    overflow: "hidden",
                    marginTop: "10px"
                  }}
                />
    </div>)}})}
      </pre>
      {admin ? (
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Fine Tune
      </Button>
      ):null}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="feedback-dialog-title"
        maxWidth="md" // Set the maxWidth to a larger value, e.g., 'md', 'lg', 'xl', or a custom width
        fullWidth // Makes the dialog take up the full width of the screen
        PaperProps={{
          style: {
            minHeight: '70vh', // Adjust the height of the dialog by setting the minHeight value
          },
        }}
      >
        <DialogTitle id="feedback-dialog-title">Improve the AI Response</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            defaultValue={botResoponse}
            onChange={handleTextChange}
          />
        </DialogContent>
        <DialogActions>
        <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          The feedback has been saved
        </Alert>
      </Snackbar>
        
      
    </>
  );
};

export default BotResponse;
