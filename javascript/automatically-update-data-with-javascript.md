# Automatically update data with JavaScript
Simple way to update data without user interaction in a ReactJS application.
Either setTimeout or setInterval could be used.

#### React component
```javascript
import React, { Component } from 'react';

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
    // Variable to store the timeoutID
    this.timeoutID = null;
    // Bind 'this' to getData so that the right 'this' is used in the callback
    this.getData = this.getData.bind(this);
  }

  componentDidMount() {
    // Initial call to getData()
    this.getData();
  }

  componentWillUnmount() {
    // Clear the timeout to prevent getData() being called after unmounting this component
    clearTimeout(this.timeoutID);
  }

  async getData() {
    const response = await fetch('endpoint URL');
    const data = await response.json();
    this.setState({ data: [...data] });
    // Call getData() in 1 minute and keep a reference to the timeout
    this.timeoutID = setTimeout(this.getData, 60000);
  }

  render() {
    return (
      <div>
        Render data
      </div>
    );
  }
}

export default MyComponent;
```

#### getData() with Promise Chaining
```javascript
getData() {
  fetch('endpoint URL')
    .then(response => response.json())
    .then(data => {
      this.setState({ data: [...data] });
      // Call getData() in 1 minute and keep a reference to the timeout
      this.timeoutID = setTimeout(this.getData, 60000);
    });
}
```
