import React, { useEffect } from 'react';
import { all_words, words } from './words';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faArrowTurnDown, faDeleteLeft } from '@fortawesome/free-solid-svg-icons';

import colors from './colors';

import './style.css';

const keyboard = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

const keyColors = new Map();
const message_length = 1600;

class Attempt extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pos: 0,
    };
  }

  bgColors() {
    if (!this.props.done) return Array(5).fill('#000');

    console.log('bgColors has been called');

    let word = this.props.word.toUpperCase().slice().split('');
    let attempt = this.props.chars.slice();

    for (let i = 0; i < word.length; i++) {
      if (word[i] == attempt[i]) {
        word[i] = '';
        attempt[i] = colors.green; //green
      }
    }

    for (let i = 0; i < attempt.length; i++) {
      if (word.includes(attempt[i])) {
        word[word.indexOf(attempt[i])] = '';
        attempt[i] = colors.yellow; //yellow
      } else if (attempt[i].length <= 1) {
        attempt[i] = colors.grey; //grey
      }
    }

    return attempt;
  }

  checkWin(tileColors){
    let win = true;
    for(let i = 0; i < tileColors.length; i++)
      if(tileColors[i] != colors.green) win = false;
    if (win) this.props.win();
  }

  render() {
    const attempt = this.props.chars.slice();
    const tileColors = this.bgColors();

    const blocks = this.props.chars.map((char, i) => {
      let flip = false;
      if (this.props.done) flip = true;
      return (
        <LetterBlock
          letter={char}
          pos={i}
          bgcolor={tileColors[i]}
          animationdata={this.props.restarting ? 'flipBack' : (flip ? 'flip' : (char != '' ? 'pulse' : ''))}
          animationEnd={() => {
            this.props.changeKeyColor(attempt, tileColors);
            this.checkWin(tileColors);
            this.props.checkLose();
          }}
          flipDelay={(i * 250).toString() + 'ms'}
        />
      );
    });

    return <div className="attempt">{blocks}</div>;
  }
}

function LetterBlock(props) {
  const delay = ((props.animationdata == 'flip') ? props.flipDelay : '0s');
  const card = (
    <div
      className="letter"
      animationData={props.animationdata}
      style={{
        animationDelay:delay,
      }}
      letter={props.letter}
      onAnimationEnd={() => {
        if (props.pos == 4 && props.animationdata == 'flip')
          props.animationEnd();
      }}
    >
      <div className="back" style={{ backgroundColor: props.bgcolor }}>
        {props.letter}
      </div>
      <div className="front">{props.letter}</div>
    </div>
  );

  return <div className="container">{card}</div>;
}

function KbKey(props) {
  return (
    <button
      className={'kb-btn ' + props.class}
      style={{ backgroundColor: props.keyColor }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        props.onClick();
        return false;
      }}
    >
      {props.label}
    </button>
  );
}

class Keyboard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="keyboard">
        {keyboard.map((str, i) => {
          return (
            <div className={'keyboard-row ' + `row${i}`}>
              {i == 2 ? (
                <KbKey
                  label={<FontAwesomeIcon icon={faArrowTurnDown} className="fa-rotate-90"/>}
                  onClick={() => this.props.onEnter()}
                  class="kb-btn  enter-btn"
                  keyColor={colors.light_grey}
                />
              ) : null}
              {str.split('').map((l) => (
                <KbKey
                  label={l}
                  onClick={() =>
                    this.props.onClick({
                      code: 'Key' + l.toUpperCase(),
                      key: l,
                    })
                  }
                  keyColor={this.props.keyColors[l]}
                />
              ))}
              {i == 2 ? (
                <KbKey
                  label={<FontAwesomeIcon icon={faDeleteLeft} />}
                  onClick={() => this.props.onBackspace()}
                  class="kb-btn bs-btn"
                  keyColor={colors.light_grey}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }
}

class Wordle extends React.Component {
  handlekeydown = (event) => {
    if (this.state.won) return;
    if (event.code.includes('Key')) {
      if (this.state.pos < 5 && this.state.current < 6) {
        this.addLetter(event.key);
        this.setState({ pos: this.state.pos + 1 });
      }
    } else if (event.key.toLowerCase() == 'backspace') {
      if (this.state.pos > 0) {
        this.removeLetter();
        this.setState({
          pos: this.state.pos - 1,
        });
      }
    } else if (event.key.toLowerCase() == 'enter') {
      if (this.state.pos < 5) {
        this.push_message('Word too short');
        return;
      }
      const current_attepmt = this.state.attempts[this.state.current]
        .join('')
        .toLowerCase();
      if (
        words.includes(current_attepmt) ||
        all_words.includes(current_attepmt)
      ) {
        const s = {...this.state};
        s.current++; s.pos=0;
        this.setState({ current: this.state.current + 1, pos: 0 });
        localStorage.setItem('gameState', JSON.stringify(s));
      } else {
        this.push_message('Word cannot be used');
      }
    }
  };

  constructor(props) {
    super(props);

    let word = words[Math.floor(Math.random() * words.length)];
    console.log(word);

    const kb = keyboard.join(''); //'qwertyuiopasdfghjklzxcvbnm'

    for (let i = 0; i < kb.length; i++) {
      keyColors[kb[i]] = colors.light_grey;
    }

    const savedData = JSON.parse(localStorage.getItem('gameState'));

    this.state = savedData != null ? savedData : {
      word: word,
      attempts: Array(6).fill(Array(5).fill('')),
      current: 0,
      pos: 0,
      messages: [],
      won: false,
      animations: {'animations': false},

      keyColors: keyColors,
    };
  }

  addLetter(char) {
    const attempts = this.state.attempts.slice();
    const a = attempts[this.state.current].slice();

    a[this.state.pos] = char.toUpperCase();
    attempts[this.state.current] = a;

    this.setState({
      attempts: attempts,
    });
  }

  removeLetter() {
    const attempts = this.state.attempts.slice();
    const attempt = attempts[this.state.current].slice();

    attempt[this.state.pos - 1] = '';
    attempts[this.state.current] = attempt;

    this.setState({
      attempts: attempts,
    });
  }

  changeKeyColor(letters, bgColors) {
    const kbColors = { ...this.state.keyColors };

    letters.forEach((letter, i) => {
      const currentColor = kbColors[letter.toLowerCase()];
      const nextColor = colors.getHigher(bgColors[i], currentColor);

      kbColors[letter.toLowerCase()] = nextColor;
    });

    this.setState({
      keyColors: kbColors,
    });
  }

  push_message(message, time_factor = 1) {
    const messages = this.state.messages.slice().concat(message);

    this.setState({
      messages: messages,
    });

    console.log(this.state.messages);
    setTimeout(() => {
      const currentMessages = this.state.messages;
      currentMessages.splice(0, 1);
      this.setState({
        messages: currentMessages,
      });
      console.log(currentMessages);
    }, message_length * time_factor);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handlekeydown);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handlekeydown);
  }

  win(){
    this.setState({
      won: true,
    })
  }

  restart(){
    let word = words[Math.floor(Math.random() * words.length)];

    const kb = keyboard.join(''); //'qwertyuiopasdfghjklzxcvbnm'

    for (let i = 0; i < kb.length; i++) {
      keyColors[kb[i]] = colors.light_grey;
    }

    this.setState({restarting: true})

    setTimeout(()=>{
      this.setState({
        attempts: Array(6).fill(Array(5).fill('')),
      })
    }, 400)
    setTimeout(()=>{
      this.setState({
        word: word,
        pos: 0,
        keyColors: keyColors,
        restarting: false, 
        won: false,
        current: 0,
      })
    }, 1000)
  }

  render() {
    const attempts = this.state.attempts.slice();
    const blocks = attempts.map((attempt, i) => {
      return (
        <Attempt
          key={i}
          className="attempt"
          chars={attempt}
          done={i < this.state.current}
          restarting={i<this.state.current?this.state.restarting:false}
          word={this.state.word}
          win={()=>this.win()}
          checkLose={()=>{if(!this.state.won && i == 5){this.push_message(this.state.word, 5)}}}
          changeKeyColor={(letter, color) => this.changeKeyColor(letter, color)}
        />
      );
    });
    return (
      <div>
        <div className="header">
          <h1>wordle</h1>
          <FontAwesomeIcon icon={faRotate} className={`restart-icon ${this.state.restarting?'fa-spin':null}`} style={{'--fa-animation-duration': '0.5s', '--fa-animation-timing-function':'cubic-bezier(1,.02,0,1)', '--fa-animation-iteration-count':2}} onClick={()=>this.restart()} />
        </div>
        <div className="messages">
          {this.state.messages.map((message, i) => (
                message ? <div
                  className="on-top-message"
                  style={{ animationDuration: `${message_length}ms` }}
                >
                  {message}
                </div> : null
              ))
            }
        </div>
        <div className="board">{blocks}</div>

        <Keyboard
          onClick={this.handlekeydown}
          onEnter={() => this.handlekeydown({ code: 'Enter', key: 'Enter' })}
          onBackspace={() =>
            this.handlekeydown({ code: 'backspace', key: 'backspace' })
          }
          keyColors={this.state.keyColors}
        />
      </div>
    );
  }
}

export default function App() {
  return <Wordle />;
}
