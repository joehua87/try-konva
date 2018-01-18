import React from "react";
import ReactDOM from "react-dom";
import { Layer, Rect, Stage, Group, Image, Text } from "react-konva";

const state = {
  items: [
    {
      type: 'text',
      content: '',
      fontSize: '',
      fontFamily: '',
      fontWeight: '', // Dropdown
      offset: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
    },
    {
      type: 'image',
      src: '',
      offset: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
    }
  ]
}

class MyRect extends React.Component {
  state = { color: "green", x: 30, y: 30 };
  componentDidMount() {
    const image = new window.Image();
    const image1 = new window.Image();
    image.src =
      "https://scontent.fsgn4-1.fna.fbcdn.net/v/t34.0-12/26105313_10208821307088735_1973258509_n.jpg?oh=db15579c03ed48b1e6ed000b2a40c9c4&oe=5A4796D6";
    image.onload = () => {
      this.setState({
        image: image
      });
    };
    image1.src =
      "https://image.flaticon.com/icons/svg/49/49856.svg";
    image1.onload = () => {
      this.setState({
        image: image,
        image1: image1,
      });
    };
  }
  handleClick = () => {
    // window.Konva is a global variable for Konva framework namespace
    console.log("Click");
    this.setState({
      color: window.Konva.Util.getRandomColor()
    });
  };

  handleDragEnd = e => {
    console.log("Drag");
    const { x, y } = e.target.attrs;
    console.log({ x, y });
    console.log("change size rect", this.rect);
    const rect = this.rect;

    // if (!rect) return

    // to() is a method of `Konva.Node` instances
    rect.to({
      scaleX: Math.random() + 0.8,
      scaleY: Math.random() + 0.8,
      duration: 0.2,
      x,
      y
    });

    this.setState(
      {
        x,
        y
      },
      () => {
        console.log(this.rect);
      }
    );
  };

  render() {
    console.log("rect", this.rect);
    return (
      <Layer>
        {this.props.show && <Image strokeWidth={4} x={0} y={0} image={this.state.image} />}
        <Image draggable strokeWidth={4} x={0} y={0} width={250} height={200} image={this.state.image1} />
        {/* <Rect
          ref={ref => {
            console.log("get refs");
            this.rect = ref;
          }}
          x={0}
          y={0}
          stroke="black"
          strokeWidth={4}
          width={200}
          height={200}
          shadowBlur={5}
          fill="red"
          // draggable
          onClick={this.handleClick}
          onDragEnd={this.handleDragEnd}
          // onDragStart={this.handleDragEnd.bind(this)}
        /> */}
        <Text draggable text={"Hello Pp"} x={50} y={50} fontSize={50} fontFamily="Pacifico" />
      </Layer>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className="w-100">
        <link href="https://fonts.googleapis.com/css?family=Pacifico" rel="stylesheet" />
        <Stage
          width={700}
          height={700}
          style={{ width: 700, height: 700 }}
          className="ba b--light-gray dib center"
        >
          <MyRect />
        </Stage>
        <Stage
          width={700}
          height={700}
          style={{ width: 700, height: 700 }}
          className="ba b--light-gray dib center"
        >
          <MyRect show />
        </Stage>
      </div>
    );
  }
}
