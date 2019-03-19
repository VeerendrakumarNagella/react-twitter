import React, { Component } from 'react';
import TwitterLogin from 'react-twitter-auth';

class App extends Component {

  constructor() {
    super();

    this.state = { isAuthenticated: false, user: null, token: ''};
  }

  onSuccess = (response) => {
    const token = response.headers.get('x-auth-token');
    response.json().then(user => {
      console.log(user);
      if (token) {
        this.setState({isAuthenticated: true, user: user, token: token});
      }
    });
  };

  onFailed = (error) => {
    alert(error);
  };

  logout = () => {
    this.setState({isAuthenticated: false, token: '', user: null})
  };

  render() {
    let content = !!this.state.isAuthenticated ?
      (
        <div>
          <p>Authenticated</p>
          <div>
            <strong>UserName: </strong> <span>{this.state.user._json.screen_name}</span>
            <br />
            <img src={this.state.user._json.profile_image_url} />
            <br />
            <p>
              Tweets count: {this.state.user._json.statuses_count}
            </p>
            <h2>
              The tweets first 100 Tweets are:
            </h2>
            <p>
                {this.state.user._json.status.text}
            </p>
          </div>
          <div>
            <button onClick={this.logout} className="button" >
              Log out
            </button>
          </div>
        </div>
      ) :
      (
        <TwitterLogin loginUrl="http://localhost:4000/api/v1/auth/twitter"
                      onFailure={this.onFailed} onSuccess={this.onSuccess}
                      requestTokenUrl="http://localhost:4000/api/v1/auth/twitter/reverse"/>
      );

    return (
      <div className="App">
        {content}
      </div>
    );
  }
}

export default App;
