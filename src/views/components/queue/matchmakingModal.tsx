import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import Modal from 'react-modal';
import { Socket } from 'socket.io';

Modal.setAppElement('#matchMakingTimer');
type ButtonId = 'rankBtn' | 'unrankBtn';

// Connect with match.tsx

export function MatchMakingModal() {
  // All useStates
  const [clickedButton, setClickedButton] = useState<ButtonId | null>(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [showElement, setShowElement] = useState(false);
  const [count, setCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [second, setSecond] = useState(60);
  const [confirmJoinGame, setConfirmJoinGame] = useState(false);
  const [intervalId, setIntervalId] = useState<any | null>(1);
  const [intervalId2, setIntervalId2] = useState<any | null>(null);
  const [startCountdown, setStartCountdown] = useState(false);

  // @ts-ignore
  const socket_: Socket = socket;

  // Variables for timer
  const minutes = Math.floor(count / 60);
  const seconds = count % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // To create a countup timer
  useEffect(() => {
    socket_.on('confirm-ready-to-play', function () {
      setStartCountdown(true); // Start the countdown timer
      setModalOpen(true);
      setShowElement(false);
      setClickedButton(null);
    });
    socket_.on('leave-queue', function () {
      setShowElement(false);
      setClickedButton(null);
      setButtonsDisabled(false);
    });
    socket_.on('declined-to-play', function (data) {
      setModalOpen(false);
      if (data.decliningPlayer !== data.username) {
        document.getElementById('unrankButton').click();
      }
      alert(data.decliningPlayer + ' has left the queue');
    });
    socket_.on('game-has-begun', function () {
      setModalOpen(false);
      setStartCountdown(false);
    })
  }, []);

  useEffect(() => {
    let newIntervalId: any;

    if (startCountdown && second > 0) {
      newIntervalId = setInterval(() => {
        setSecond((prevSecond) => prevSecond - 1);
      }, 1000);
    } else if (second === 0) {
      socket_.emit('initiate-unranked-game', { playerReady: false });
      setStartCountdown(false);
    }
  
    setIntervalId2(newIntervalId);
  
    return () => {
      clearInterval(newIntervalId);
    };
  }, [startCountdown, second]);
  
  // Handlers
  const handleClick = (button: ButtonId) => {
    setSecond(60);
    setConfirmJoinGame(false);
    clearInterval(intervalId);
    const newIntervalId = setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);
    setIntervalId(newIntervalId);
    console.log(newIntervalId);
    const playerObj = {
      numPlayers: 6,
    };
  
    setClickedButton(button);
    setShowElement(true);
  
    if (button === 'unrankBtn') {
      socket_.emit('join-unranked-queue', playerObj);
    }
  };

  const leaveQueue = () => {
    socket_.emit('leave-unranked-queue');
    console.log(intervalId);
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
    setIntervalId(null);
    setCount(0);
    setShowElement(false);
  };

  const joinGame = () => {
    socket_.emit('initiate-unranked-game', { playerReady: true });
    setConfirmJoinGame(true);
    clearInterval(intervalId2);
    setStartCountdown(false);
    console.log("the id is " + intervalId);
    if (intervalId) {
      console.log("closing id is " + intervalId);
      clearInterval(intervalId);
      setCount(0);
    }
    setIntervalId(null);
    console.log(intervalId);
  };

  const cancelQueue = () => {
    setStartCountdown(false);
    socket_.emit('initiate-unranked-game', { playerReady: false });
  };

  const btnStyle = (button: ButtonId) => {
    const baseStyle: React.CSSProperties = { backgroundColor: 'transparent' };
    if (clickedButton === button) {
      baseStyle.backgroundColor = 'yellow';
    }
    if (buttonsDisabled) {
      baseStyle.backgroundColor = 'transparent';
      baseStyle.cursor = 'not-allowed';
    }
    return baseStyle;
  };

  const buttonProps = (button: ButtonId) => {
    const props: React.ButtonHTMLAttributes<HTMLButtonElement> = {
      style: btnStyle(button),
      onClick: () => handleClick(button),
    };
    if (clickedButton && clickedButton !== button) {
      props.disabled = true;
    }
    if (buttonsDisabled) {
      props.disabled = true;
    }
    return props;
  };

  function Loading() {
    return (
      <div>
        <p>You are in Queue:</p>
        <h1>{formattedTime}</h1>
        <button onClick={leaveQueue}>Leave Queue</button>
      </div>
    );
  }

  return (
    <div className="matchmaking-container">
      <button
        {...buttonProps('rankBtn')}
        className="matchmaking-btn btn btn-default"
      >
        Rank Game
      </button>

      <button
        {...buttonProps('unrankBtn')}
        id="unrankButton"
        className="matchmaking-btn btn btn-default"
      >
        Unranked Game
      </button>

      {showElement && <Loading />}

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Modal"
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          content: {
            width: '400px',
            height: '200px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <div>
          <h1>Match Found!</h1>
          <p>{confirmJoinGame ? 'Waiting for other players!' : second}</p>
          <button onClick={joinGame}>Join</button>
          <button onClick={cancelQueue}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

export default hot(MatchMakingModal);
