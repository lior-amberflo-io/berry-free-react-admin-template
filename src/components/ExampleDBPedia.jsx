import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChatBot, { Loading } from 'react-simple-chatbot';

class DBPedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      result: '',
      trigger: false,
    };

    this.triggetNext = this.triggetNext.bind(this);
  }

  componentWillMount() {
    const self = this;
    const { steps } = this.props;
    const search = steps.search.value;
    callAPI();
    async function callAPI() {
        try {
          const response = await fetch("https://4sho3o2nok.execute-api.us-west-2.amazonaws.com/prod/chatgpt", {
            method: "POST",
            crossDomain:true,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: search }),
            //body: inputPrompt,//
          });
          const data = await response.json();
          self.setState({ loading: false, result: data.responseBot, trigger: true });
          console.log(data.responseBot)
          
          //setErr(false);
        } catch (err) {
          //setErr(err);
          console.log(err);
        }
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
          });
        //  Set responseFromAPI back to false after the fetch request is complete
        //setReponseFromAPI(false);
      }
  }

  

  triggetNext() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep();
    });
  }

  render() {
    const { trigger, loading, result } = this.state;

    return (
      <div style={{
        textAlign: 'center',
        marginTop: 20,
        color: "#333131",
      }}>
        { loading ? <Loading /> : result }
        {
          !loading &&
          <div
            style={{
              textAlign: 'left',
              marginTop: 20,
            }}
          >
           
          </div>
        }
      </div>
    );
  }
}

DBPedia.propTypes = {
  steps: PropTypes.object,
  triggerNextStep: PropTypes.func,
};

DBPedia.defaultProps = {
  steps: undefined,
  triggerNextStep: undefined,
};

const ExampleDBPedia = () => (
  <ChatBot
    steps={[
      {
        id: '1',
        message: 'Type something to search on Wikipédia. (Ex.: Brazil)',
        trigger: 'search',
        waitAction: true,
      },
      {
        id: 'search',
        user: true,
        trigger: '3',
      },
      {
        id: '3',
        component: <DBPedia />,
        waitAction: true,
        trigger: '1',
      },
    ]}
  />
);

export default ExampleDBPedia;