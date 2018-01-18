// @flow

import React, { PureComponent } from 'react'
import { Layer, Stage, Image, Text } from 'react-konva'
import cn from 'classnames'
import FontFaceObserver from 'fontfaceobserver'
import dot from 'dot-prop-immutable'

const defaultImage = {
  type: 'image',
  src:
    'https://greensock.com/wp-content/themes/greensock/images/icon-github.svg',
  display: {
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  },
}
const defaultText = {
  type: 'text',
  fontSize: 20,
  fontFamily: 'Pacifico',
  text: 'type a text...',
  display: {
    x: 0,
    y: 0,
    // width: 200,
    // height: 200,
  },
}

type TProductCustomer = {
  items?: any[],
  fonts?: { src: string, name: string }[],
  images?: { [key: string]: string[] },
  onChange?: Function,
}

class ProductCustomer extends PureComponent<TProductCustomer, any> {
  constructor(props: any) {
    super(props)
    const { items } = props || {}
    this.state = {
      items: items || [],
      selected: -1,
      imageTabSelected: 0,
    }
  }

  fonts: any = {}

  images: any = {}

  layer: any

  typings: any = {}

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
    return true
  }

  watchFontLoading = (fontFamily: string, ref: any) => {
    const font = new FontFaceObserver(fontFamily, {
      weight: 400,
    })
    font.load().then(
      () => {
        // console.log('Font', fontFamily, 'is available')
        this.fonts[fontFamily] = true
        ref.getLayer().batchDraw()
      },
      () => {
        // console.log('Font', fontFamily, 'is not available')
      },
    )
  }

  onDragUpdateOffset = ({ x, y }: { x: number, y: number }, idx: number) => {
    let { items } = this.state
    items = [...items]
    items[idx] = {
      ...(items[idx] || {}),
      display: {
        ...((items[idx] && items[idx].display) || {}),
        x,
        y,
      },
    }
    this.setState({ items })
  }

  onDragItem = (e: any, idx: number) => {
    this.onDragUpdateOffset(e.target._lastPos, idx)
  }

  onTyping = (key: string, callback: Function, timeout?: number = 500) => {
    if (this.typings && this.typings[key]) clearTimeout(this.typings[key])
    this.typings[key] = setTimeout(callback, timeout)
  }

  updateItem = (
    idx: number,
    { label, value }: { label: string, value: any },
  ) => {
    const { items } = this.state
    this.setState({ items: dot.set(items, `${idx}.${label}`, value) })
  }

  addItem = (item: any) => {
    const { items } = this.state
    this.setState({ items: [...items, item] })
  }

  removeItem = (idx: number) => {
    const { items } = this.state
    this.setState({ selected: -1, items: dot.delete(items, idx) })
  }

  renderItem = (
    {
      type,
      display,
      ...props
    }: {
      type: string,
      display: any,
      text?: string,
      fontSize?: number,
      fontFamily?: string,
      src?: string,
    },
    idx: number,
  ) => {
    const { x, y, height, width } = display || {}

    if (!['text', 'image'].includes(type)) return null

    const handleShowEdit = () => {
      this.setState({
        selected: idx,
      })
    }

    if (type === 'text') {
      const { text, fontSize, fontFamily } = props || {}
      return (
        <Text
          ref={(ref) => {
            if (fontFamily && !this.fonts[fontFamily]) {
              this.watchFontLoading(fontFamily, ref)
            }
          }}
          key={idx}
          draggable
          text={text}
          x={x}
          y={y}
          width={width}
          height={height}
          onClick={handleShowEdit}
          onDragStart={handleShowEdit}
          onDragEnd={e => this.onDragItem(e, idx)}
          fontSize={fontSize}
          fontFamily={fontFamily}
        />
      )
    }
    if (type === 'image') {
      const { src } = props || {}
      const image = (src && this.createImage(src, 0)) || null
      return (
        <Image
          ref={(ref) => {
            this.images[src] = ref
          }}
          key={idx}
          draggable
          strokeWidth={4}
          x={x}
          y={y}
          width={width}
          height={height}
          onClick={handleShowEdit}
          onDragStart={handleShowEdit}
          onDragEnd={e => this.onDragItem(e, idx)}
          image={image}
        />
      )
    }

    return null
  }

  renderPreview = () => {
    const { items } = this.state
    return (
      <Stage
        width={600}
        height={600}
        style={{ width: 600, height: 600 }}
        className="ba b--light-gray dib center"
      >
        <Layer>
          {(items || [])
            .map((item, i) => this.renderItem(item, i))
            .filter(x => !!x)}
        </Layer>
      </Stage>
    )
  }

  renderSizeEditor = () => {
    const { selected: idx } = this.state
    const item = dot.get(this.state, `items.${idx}`)
    if (idx < 0 || !item) return null
    const { display: { width, height } } = item || {}
    return (
      <div className="pv3 w-100 flex flex-wrap items-start">
        <div className="flex flex-wrap flex-auto">
          <span className="db mb2 w-100 ttu f7">Width</span>
          <input
            type="number"
            min="1"
            max="500"
            className="w-100 pa2 ba b--near-white outline-0 dark-gray br1"
            defaultValue={width}
            onChange={(e) => {
              const { value } = e.target
              this.onTyping(`${idx}.width`, () =>
                this.updateItem(idx, { label: 'display.width', value }),
              )
            }}
          />
        </div>
        <div className="pl3 flex flex-wrap flex-auto">
          <span className="db mb2 w-100 ttu f7">Height</span>
          <input
            type="number"
            min="1"
            max="500"
            className="w-100 pa2 ba b--near-white outline-0 dark-gray br1"
            defaultValue={height}
            onChange={(e) => {
              const { value } = e.target
              this.onTyping(`${idx}.height`, () =>
                this.updateItem(idx, { label: 'display.height', value }),
              )
            }}
          />
        </div>
      </div>
    )
  }

  renderTextEditor = () => {
    const { selected: idx } = this.state
    const item = dot.get(this.state, `items.${idx}`)
    if (idx < 0 || !item) return null
    const { fonts } = this.props
    const { text: message, fontSize, fontFamily } = item || {}
    return (
      <div key={idx} className="w-100">
        <div className="pv3 flex flex-wrap w-100">
          <span className="db mb2 w-100 ttu f7">Message</span>
          <textarea
            className="w-100 pa2 h3 ba b--near-white outline-0 dark-gray br1"
            defaultValue={message}
            onChange={(e) => {
              const { value } = e.target
              this.onTyping(`${idx}.message`, () =>
                this.updateItem(idx, { label: 'text', value }),
              )
            }}
          />
        </div>
        <div className="pv3 w-100 flex flex-wrap items-start">
          <div className="flex-auto">
            <span className="db mb2 w-100 ttu f7">Font style</span>
            <select
              className="dib w-100 pa2 h2 ba b--near-white outline-0 dark-gray br1"
              defaultValue={fontFamily}
              onChange={(e) => {
                const { value } = e.target
                this.onTyping(`${idx}.fontFamily`, () =>
                  this.updateItem(idx, { label: 'fontFamily', value }),
                )
              }}
            >
              {(fonts || []).map(({ name }) => (
                <option value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="pl3 flex flex-wrap flex-auto">
            <span className="db mb2 w-100 ttu f7">Font size</span>
            <input
              type="number"
              min="1"
              max="100"
              className="w-100 pa2 ba b--near-white outline-0 dark-gray br1"
              defaultValue={fontSize}
              onChange={(e) => {
                const { value } = e.target
                this.onTyping(`${idx}.fontSize`, () =>
                  this.updateItem(idx, { label: 'fontSize', value }),
                )
              }}
            />
          </div>
        </div>
        {this.renderSizeEditor()}
      </div>
    )
  }

  renderImageEditor = () => {
    const { selected: idx, imageTabSelected } = this.state
    const item = dot.get(this.state, `items.${idx}`)
    if (idx < 0 || !item) return null
    const { images } = this.props
    const keys = Object.keys(images || {})
    const keySelected = imageTabSelected || keys[0]
    const { src } = item || {}
    return (
      <div className="w-100">
        <div className="pv3 flex flex-wrap w-100">
          <span className="db mb2 w-100 ttu f7">Url</span>
          <input
            className="w-100 pa2 ba b--near-white outline-0 dark-gray br1"
            defaultValue={src}
            onChange={(e) => {
              const { value } = e.target
              this.onTyping(`${idx}.src`, () =>
                this.updateItem(idx, { label: 'src', value }),
              )
            }}
          />
        </div>
        {this.renderSizeEditor()}
        <div className="pv3 flex flex-wrap w-100">
          <span className="db mb2 w-100 ttu f7">Gallery</span>
          <div className="flex flex-nowrap items-start jutify-center w-100 overflow-x-auto">
            {(keys || []).map(k => (
              <div
                key={k}
                className={cn(
                  'flex-none pv2 mh2 f7 ttu fw3 pointer bb',
                  keySelected === k ? 'dark-gray b--gray' : 'gray b--white',
                )}
                onClick={() => this.setState({ imageTabSelected: k })}
              >
                {k}
              </div>
            ))}
          </div>
          <div
            className="flex flex-wrap items-start jutify-center w-100 pa3 overflow-y-auto"
            style={{ maxHeight: '12rem' }}
          >
            {((images && images[keySelected]) || []).map(imgSrc => (
              <div
                key={imgSrc}
                className="relative w-25 pa1 pointer"
                onClick={() =>
                  this.updateItem(idx, { label: 'src', value: imgSrc })
                }
              >
                <div
                  className={cn(
                    'w-100 aspect-ratio--1x1 bg-center contain ba br1',
                    imgSrc === src ? 'b--moon-gray' : 'b--near-white',
                  )}
                  style={{ backgroundImage: `url(${imgSrc})` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  renderEditorPreview = () => {
    const { selected } = this.state
    const item = dot.get(this.state, `items.${selected}`)
    if (selected < 0 || !item) return null
    if (item.type === 'text') return this.renderTextEditor()
    if (item.type === 'image') return this.renderImageEditor()
    return null
  }

  renderListItem = (item: any, idx: number) => {
    const { type } = item || {}
    if (type === 'text') {
      const { text, fontFamily } = item || {}
      return (
        <div className="mv1 pv1 ph2 flex items-center w-100 bg-near-white br1">
          <div
            className="flex items-center justify-center pv2 w-10 bg-white gray f7 fw3 br2 pointer"
            onClick={() => this.setState({ selected: idx })}
          >
            {idx}
          </div>
          <div
            className="w-90 pa2 truncate pointer"
            onClick={() => this.setState({ selected: idx })}
          >
            <span style={{ fontFamily }} title={text}>
              {text}
            </span>
          </div>
          <div
            className="flex items-center justify-center pa2 bg-transparent dark-gray f7 fw7 br2 pointer"
            onClick={() => this.removeItem(idx)}
          >
            x
          </div>
        </div>
      )
    }
    if (type === 'image') {
      const { src } = item || {}
      return (
        <div className="mv1 pv1 ph2 flex items-center w-100 bg-near-white br1">
          <div
            className="flex items-center justify-center pv2 w-10 bg-white gray f7 fw3 br2 pointer"
            onClick={() => this.setState({ selected: idx })}
          >
            {idx}
          </div>
          <div
            className="w-90 pa2 truncate pointer"
            onClick={() => this.setState({ selected: idx })}
          >
            <span title={src}>[image] {src}</span>
          </div>
          <div
            className="flex items-center justify-center pa2 bg-transparent dark-gray f7 fw7 br2 pointer"
            onClick={() => this.removeItem(idx)}
          >
            x
          </div>
        </div>
      )
    }
    return null
  }

  renderEditor = () => {
    const { items, selected } = this.state
    const renderEditorPreview = this.renderEditorPreview()
    return (
      <div className="flex-auto pa3  pc f6 fw3 gray">
        {/* <span onClick={() => this.addItem(te)}>add text</span>
        <span onClick={() => this.addItem(im)}>add image</span>
        <span
          onClick={() => {
            const x = prompt('Please index')
            this.removeItem(x)
          }}
        >
          remove
        </span> */}
        <div>
          <div className="flex flex-wrap items-center justify-start w-100">
            <div
              className="pointer dib pv2 ph3 bg-blue white br1"
              onClick={() => this.addItem(defaultText)}
            >
              Add a text
            </div>
            <div
              className="ml2 pointer dib pv2 ph3 bg-blue white br1"
              onClick={() => this.addItem(defaultImage)}
            >
              Add a image
            </div>
            {selected >= 0 && (
              <div
                className="ml3 pointer dib pv2 ph3 bg-red white br1"
                onClick={() => this.removeItem(selected)}
              >
                Delete
              </div>
            )}
          </div>
          <div className="mt2 pv3 flex flex-wrap items-center w-100">
            <div className="mb2 f7 ttu">
              <span>List item added</span>
            </div>
            <div
              className="pa1 w-100 overflow-y-auto"
              style={{ maxHeight: '12rem' }}
            >
              {items.length === 0 && (
                <span className="db pa2 bg-near-white br1 i f7">
                  Not have any custom
                </span>
              )}
              {(items || []).map((item, idx) => this.renderListItem(item, idx))}
            </div>
          </div>
          {renderEditorPreview}
        </div>
      </div>
    )
  }

  render() {
    const { onChange } = this.props
    if (onChange) {
      onChange(this.state)
    }
    return (
      <div
        data-component="ProductCustomer"
        className="w-90 mw8 center flex items-start justify-center"
      >
        {this.renderEditor()}
        {this.renderPreview()}
      </div>
    )
  }
}

export default () => (
  <div className="w-100">
    <link
      href="https://fonts.googleapis.com/css?family=Roboto"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Pacifico"
      rel="stylesheet"
    />
    <ProductCustomer
      fonts={[
        {
          name: 'Pacifico',
          src: 'https://fonts.googleapis.com/css?family=Pacifico',
        },
        {
          name: 'Roboto',
          src: 'https://fonts.googleapis.com/css?family=Roboto',
        },
      ]}
      images={{
        'Group A': [
          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Icons8_flat_shop.svg/2000px-Icons8_flat_shop.svg.png',
          'https://vignette.wikia.nocookie.net/logopedia/images/2/23/Gameloft_logo_flat.svg',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Icons8_flat_gallery.svg/2000px-Icons8_flat_gallery.svg.png',
        ],
        'Group B': [
          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/725px-NASA_logo.svg.png',
          'https://upload.wikimedia.org/wikipedia/commons/3/3a/Burger_King_Logo.svg',
          'https://cdn.worldvectorlogo.com/logos/slack-1.svg',
        ],
      }}
      onChange={(state: any) => console.log('state updated', state)}
    />
  </div>
)
