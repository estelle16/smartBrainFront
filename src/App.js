import React, { Component } from 'react';
import './App.css';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import Signin from './Components/SignIn/Signin';
import Register from './Components/Register/Register';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';



const app = new Clarifai.App({
 apiKey: 'db63388733b64220aa8eafd2a0cefe61'
});


const particlesOptions = {

  particles: {
      
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800
        }
      }
    }
}

const initialState = {
  input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email:'',
        entries: 0,
        joined: ''
      }
}


class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser =(data) => {
    this.setState( {user :{
        id: data.id,
        name: data.name,
        email:data.email,
        entries: data.entries,
        joined: data.joined
      }

    })
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000/')
  //     .then(response => response.json())
  //     .then(console.log)
  // }

  calculateFaceLocation = (data) => {
    const faceBox = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    
    return {
      leftCol: faceBox.left_col * width,
      topRow: faceBox.top_row * height,
      rightCol: width - (faceBox.right_col * width),
      bottomRow: height - (faceBox.bottom_row * height)
    }

  }

  displayFaceBox = (box) => {
   
    this.setState({box : box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});

  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
    .then(response => {

      if(response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id,
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count}))
        })
        .catch(err => {
          console.log(err);
        })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
     
  }

  onRouteChange = (route) => {
    if (route ==='signout') {
      this.setState (initialState)
    } else if (route === 'home') {
      this.setState ({isSignedIn: true})
    }

    this.setState({route: route});
  }



  render() {
    return (
      <div className="App">
        
        <Particles className = 'particles'
          params = {particlesOptions}
          />

        <Navigation isSignedIn = {this.state.isSignedIn} onRouteChange = {this.onRouteChange} />
        { this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank name = {this.state.user.name} entries = {this.state.user.entries} />
              <ImageLinkForm  onInputChange = {this.onInputChange} 
                              onButtonSubmit = {this.onButtonSubmit} 
              />

              <FaceRecognition box = {this.state.box} imageUrl = {this.state.imageUrl} /> 
            </div>
            : (
                this.state.route === 'signin' 
                ? <Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
                : <Register loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
              )

        }
      </div>
    );
  }
}

export default App;
