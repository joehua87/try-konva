import React, { Component, PureComponent } from 'react'
import { Layer, Stage, Image, Text } from 'react-konva'
import FontFaceObserver from 'fontfaceobserver'
import dot from 'dot-prop-immutable'

const im = {
  type: 'image',
  src:
    'https://greensock.com/wp-content/themes/greensock/images/icon-github.svg',
  width: 200,
  height: 200,
  display: {
    x: 211,
    y: 45,
    width: 200,
    height: 200,
  },
}
const te = {
  type: 'text',
  fontSize: 20,
  fontFamily: 'Pacifico',
  text: 'Made by Connected JSC',
  display: {
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  },
}

class ProductCustomer extends PureComponent<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      items: props.items || [],
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps', nextProps)
  }

  componentDidMount() {
    console.log('componentDidMount')
  }

  getOffset = ({ x, y, h, w }: { [key: string]: number }) => ({
    x: x - w / 2,
    y: y - h / 2,
  })

  /**
   * createImage: will create a image dom
   * if not found window, this will repeat until
   * the reached is limited count or when the window is found
   */
  createImage = (src: string, count: number = 0, limit?: number = 10) => {
    if (count > limit) return null
    if (!window) return this.createImage(src, count + 1, limit)
    const image = new window.Image()
    image.src = src
    image.onload = () => {
      // update layer manually
      const img = this.images && this.images[src]
      if (img) img.getLayer().batchDraw()
    }
    return image
  }

  redrawLayer = () => {
    if (!this.layer || !this.layer.getPlayer) return false
    this.layer.getPlayer().batchDraw()
  }

  watchFontLoading = (fontFamily: string, ref: any) => {
    const font = new FontFaceObserver(fontFamily, {
      weight: 400,
    })
    font.load().then(
      () => {
        console.log('Font', fontFamily, 'is available')
        this.fonts[fontFamily] = true
        ref.getLayer().batchDraw()
      },
      () => {
        console.log('Font', fontFamily, 'is not available')
      },
    )
  }

  onDragUpdateOffset = ({ x, y }: { x: number, y: number }, idx: number) => {
    let { items } = this.state
    console.log('before', items[idx])
    items = [...items]
    items[idx] = {
      ...(items[idx] || {}),
      display: {
        ...((items[idx] && items[idx].display) || {}),
        x,
        y,
      },
    }
    console.log('after', items[idx])
    this.setState({ items })
  }

  onDragItem = (e: any, idx: number) => {
    this.onDragUpdateOffset(e.target._lastPos, idx)
  }

  fonts: any = {}

  images: any = {}

  layer: any

  renderItem = ({ type, display, ...props }: { type: string }, idx: number) => {
    const { x, y, height, width } = display || {}

    if (!['text', 'image'].includes(type)) return null

    if (type === 'text') {
      const { text, fontSize, fontFamily } = props || {}
      return (
        <Text
          ref={(ref) => {
            if (!this.fonts[fontFamily]) this.watchFontLoading(fontFamily, ref)
          }}
          key={idx}
          draggable
          text={text}
          x={x}
          y={y}
          width={width}
          height={height}
          onDragEnd={e => this.onDragItem(e, idx)}
          fontSize={fontSize}
          fontFamily={fontFamily}
        />
      )
    }
    if (type === 'image') {
      const { src } = props || {}
      const image = this.createImage(src, 0)
      console.log('createImage', image)
      return (
        <Image
          ref={ref => (this.images[src] = ref)}
          key={idx}
          draggable
          strokeWidth={4}
          x={x}
          y={y}
          width={width}
          height={height}
          onDragEnd={e => this.onDragItem(e, idx)}
          image={image}
        />
      )
    }
  }

  renderPreview = () => {
    console.log('render preview')
    const { items } = this.state
    console.log(items, 'items')    
    return (
      <Stage
        width={600}
        height={600}
        style={{ width: 600, height: 600 }}
        className="ba b--light-gray dib center"
      >
        <Layer ref={ref => (this.layer = ref)}>
          {(items || [])
            .map((item, i) => this.renderItem(item, i))
            .filter(x => !!x)}
        </Layer>
      </Stage>
    )
  }

  renderEditor = () => {
    console.log('render editor')
    return (
      <div>
        <span onClick={() => this.addItem(te)}>add text</span>
        <span onClick={() => this.addItem(im)}>add image</span>
        <span onClick={() => {
          var x = prompt("Please index")
          this.removeItem(x)
        }}>remove</span>
      </div>
    )
  }

  addItem = (item: TPreviewItem) => {
    const { items } = this.state
    this.setState({ items: [...items, item] })
  }

  removeItem = (idx: number) => {
    const { items } = this.state
    this.setState({ items: dot.delete(items, idx) })
  }

  render() {
    console.log('full render')
    return (
      <div data-component="ProductCustomer" className="flex flex-wrap items-center justify-center"> 
        {this.renderEditor()}
        {this.renderPreview()}
      </div>
    )
  }
}

export default class App extends Component {
  render() {
    return (
      <div className="w-100">
        <link
          href="https://fonts.googleapis.com/css?family=Pacifico"
          rel="stylesheet"
        />
        <ProductCustomer />
      </div>
    )
  }
}
