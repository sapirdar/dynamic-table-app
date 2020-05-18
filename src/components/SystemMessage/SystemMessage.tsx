import React, { Component } from 'react';
import './SystemMessage.scss';

type SystemMessageProps = {
  type: 'danger' | 'success' | 'warning';
  text: string;
}

class SystemMessage extends Component<SystemMessageProps, {}> {
  render() {
    return (
      <div className="messages">
        <div className={'alert alert-' + this.props.type} role="alert">
          <span className="mr-2">{this.props.text}</span>
          <button type="button" className="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button></div>
      </div>
    )
  }
}

export default SystemMessage;
