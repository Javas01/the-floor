"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

type FloorImage = {
  answer: string;
  src: string;
  alt: string;
};

const floorImages: FloorImage[] = [
  {
    answer: "benz",
    src: "/benz.jpg",
    alt: "Benz Logo"
  },
  {
    answer: "bentley",
    src: "/bentley.jpg",
    alt: "Bentley Logo"
  },
  {
    answer: "audi",
    src: "/audi.jpg",
    alt: "Audi Logo"
  },
  {
    answer: "toyota",
    src: "/toyota.jpg",
    alt: "Toyota Logo"
  },
  {
    answer: "honda",
    src: "/honda.jpg",
    alt: "Honda Logo"
  },
  {
    answer: "ford",
    src: "/ford.jpg",
    alt: "Ford Logo"
  },
  {
    answer: "chevrolet",
    src: "/chevrolet.jpg",
    alt: "Chevrolet Logo"
  },
  {
    answer: "nissan",
    src: "/nissan.jpg",
    alt: "Nissan Logo"
  },
  {
    answer: "volkswagen",
    src: "/volkswagen.jpg",
    alt: "Volkswagen Logo"
  },
  {
    answer: "hyundai",
    src: "/hyundai.jpg",
    alt: "Hyundai Logo"
  }
];

enum Turn {
  PlayerOne,
  PlayerTwo
}

export default function Home() {
  const [playerOne, setPlayerOne] = useState("Player 1");
  const [playerTwo, setPlayerTwo] = useState("Player 2");
  const [timerOne, setTimerOne] = useState(15);
  const [timerTwo, setTimerTwo] = useState(45);
  const [currentImage, setCurrentImage] = useState(floorImages[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [text, setText] = useState("");
  const [turn, setTurn] = useState(Turn.PlayerOne);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showCursorOne, setShowCursorOne] = useState(false);
  const [showCursorTwo, setShowCursorTwo] = useState(false);
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (!showCursorOne && !showCursorTwo) return;

    const handleKeyDown = ({ key }: KeyboardEvent) => {
      if (key === "Backspace") {
        if (showCursorOne) {
          setPlayerOne((text) => text.slice(0, -1));
        } else {
          setPlayerTwo((text) => text.slice(0, -1));
        }
        return;
      }
      if (key === "Enter") {
        if (showCursorOne) {
          setShowCursorOne(false);
        } else {
          setShowCursorTwo(false);
        }
      } else {
        if (key.length > 1) return; // if special key is pressed, do nothing
        if (showCursorOne) {
          setPlayerOne((text) => text + key);
        } else {
          setPlayerTwo((text) => text + key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCursorOne, showCursorTwo]);

  useEffect(() => {
    if (!started || gameOver) return;

    const SpeechRecognition =
      // @ts-expect-error SpeechRecognition may not be defined in the global scope
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keeps the recognition running
    recognition.interimResults = true; // Shows interim results before final text

    recognition.onresult = ({
      results
    }: {
      results: SpeechRecognitionResultList;
    }) => {
      const transcript = Array.from(results)
        .map((result) => result[0].transcript)
        .join("");

      checkAnswer(transcript);
      setText(transcript);
    };

    recognition.start();

    return () => recognition.stop(); // Cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage, started, gameOver]);

  useEffect(() => {
    if (!started || gameOver) return;

    if (timerOne <= 0) {
      setGameOver(true);
      setTimeout(() => alert(`Game Over, ${playerTwo} Wins!`), 500);
    }

    if (timerOne > 0 && turn === Turn.PlayerOne) {
      const timerId = setTimeout(() => setTimerOne(timerOne - 1), 1000);
      return () => clearTimeout(timerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerOne, turn, started]);

  useEffect(() => {
    if (!started || gameOver) return;

    if (timerTwo <= 0) {
      setGameOver(true);
      setTimeout(() => alert(`Game Over, ${playerOne} Wins!`), 500);
    }

    if (timerTwo > 0 && turn === Turn.PlayerTwo) {
      const timerId = setTimeout(() => setTimerTwo(timerTwo - 1), 1000);
      return () => clearTimeout(timerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerTwo, turn, started]);

  useEffect(() => {
    // Ensure this code runs only in the browser
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/correct.mp3");
    }
  }, []);

  function checkAnswer(transcript: string) {
    if (transcript.toLowerCase().search(currentImage.answer) !== -1) {
      setIsCorrect(true);
      audioRef.current?.play();
      setTimeout(() => {
        setText("");
        setCurrentImage(floorImages[currentImageIndex + 1]);
        setCurrentImageIndex(currentImageIndex + 1);
        setIsCorrect(false);
        if (turn === Turn.PlayerOne) {
          setTurn(Turn.PlayerTwo);
        } else {
          setTurn(Turn.PlayerOne);
        }
      }, 1000);
    }
  }

  return (
    <div className="flex flex-col justify-between items-center w-full h-full">
      <div className="w-[700px] h-[500px] relative  rounded-[8px]">
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          layout="fill"
          className="rounded-lg"
          priority
        />
      </div>
      <button
        className={
          started
            ? "hidden"
            : "bg-[#0c2589] hover:bg-[#0c2599] text-white font-bold py-2 px-4 rounded "
        }
        onClick={() => setStarted(true)}
      >
        Start Game
      </button>
      <div>{text}</div>

      <div className="flex flex-col items-center text-2xl">
        <div className="flex flex-row justify-between min-w-[500px]">
          <span className="bg-[#0c2589] text-white px-2 py-1 rounded-[2px] min-w-[200px] text-center clip-player-one">
            {playerOne}
            <span className="animate-blink">{showCursorOne ? "|" : ""}</span>
            <span
              className="cursor-pointer"
              onClick={() => {
                setPlayerOne("");
                setShowCursorOne(true);
              }}
            >
              {started ? "" : "🖊️"}
            </span>
          </span>
          <span className="bg-[#0c2589] text-white px-2 py-1 rounded-[2px] min-w-[200px] text-center clip-player-two">
            {playerTwo}
            <span className="animate-blink">{showCursorTwo ? "|" : ""}</span>
            <span
              className="cursor-pointer"
              onClick={() => {
                setPlayerTwo("");
                setShowCursorTwo(true);
              }}
            >
              {started ? "" : "🖊️"}
            </span>
          </span>
        </div>
        <div className="flex flex-row justify-between min-w-64">
          <span
            className={`${
              timerOne < 15
                ? turn === Turn.PlayerOne
                  ? "animate-pulse text-red-500"
                  : "text-red-500"
                : timerOne < 30
                ? "text-yellow-500"
                : ""
            } bg-[#0c2589] min-w-[100px] h-[50px] text-center leading-[50px] pl-[40px] clip-left-timer`}
          >
            {timerOne}
          </span>
          <div className="bg-[#0c2589] min-w-[400px] min-h-[70px] border-[3px] border-[#d1b163] flex justify-center items-center">
            <span className={!isCorrect ? "hidden" : "text-center"}>
              {currentImage.answer.toUpperCase()}
            </span>
          </div>
          <span
            className={`${
              timerTwo < 15
                ? turn === Turn.PlayerTwo
                  ? "animate-pulse text-red-500"
                  : "text-red-500"
                : timerTwo < 30
                ? "text-yellow-500"
                : ""
            } bg-[#0c2589] min-w-[100px] h-[50px] text-center leading-[50px] pr-[40px] clip-right-timer`}
          >
            {timerTwo}
          </span>
        </div>
      </div>
    </div>
  );
}
