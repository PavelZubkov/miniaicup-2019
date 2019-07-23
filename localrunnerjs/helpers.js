const { WIDTH, X_CELLS_COUNT, Y_CELLS_COUNT } = require('./constants');

const includes = exports.includes = (p, points) => !!points.find(([x, y]) => x === p[0] && y === p[1]);

exports.showCoordinates = (point) => {
  const [x, y] = point;
  console.log('helpers.showCoordinates', { x, y });
  // pyglet.text.Label('{}, {}'.format(x, y), font_name='Times New Roman',
  //   font_size=9,
  //   color=(95, 99, 104, 255),
  //   x=x, y=y,
  //   anchor_x='center', anchor_y='center').draw()
};


exports.getSquareCoordinates = (point, width=WIDTH) => {
  const [x, y] = point;

  return [
    x - width, y - width,
    x + width, y - width,
    x + width, y + width,
    x - width, y + width,
  ];
};

exports.getDiagonals = (point, width=WIDTH) => {
  const [x, y] = point;

  return [
    [x + width, y + width],
    [x - width, y + width],
    [x + width, y - width],
    [x - width, y - width],
  ];
};

exports.getVertAndHoriz = (point, width=WIDTH) => {
  const [x, y] = point;

  return [
    [x, y + width],
    [x - width, y],
    [x, y - width],
    [x + width, y],
  ];
};

exports.defGetNeighboring = (point, width=WIDTH) => {
  return [
    ...getVertAndHoriz(point, width),
    ...getDiagonals(point, width),
  ];
};


exports.getTerritoryLine = (point, points) => {
  const linePoints = [];
  let p;

  p = [...point];
  while (includes(p, points)) {
    linePoints.push(p);
    p[0] -= WIDTH;
  }
  const start = [p[0] + WIDTH, p[1]];

  p = [...point];
  while (includes(p, points)) {
    linePoints.push(p);
    p[0] += WIDTH;
  }
  const end = [p[0] - WIDTH, p[1]];

  return { linePoints, start, end };
};


exports.getLineCoordinates = (start, end, width=WIDTH) => {
  const halfWidth = Math.round(width / 2);
  const [x1, y1] = start;
  const [x2, y2] = end;

  return [
    [x2 + halfWidth, y2 + halfWidth],
    [x2 + halfWidth, y2 - halfWidth],
    [x1 - halfWidth, y1 - halfWidth],
    [x1 - halfWidth, y1 + halfWidth],
  ];
};

const TERRITORY_CACHE = {};

exports.batchDrawTerritory = (points, color, redraw, width=WIDTH) => {
  if (points.length < 100) {
    batchDraw(points, color, width);
    return;
  }

  let lines = [];
  if (!TERRITORY_CACHE[color.join()] || redraw) {
    const excluded = new Set();

    for (const point of points) {
      if (excluded.has(point)) continue;
      const { linePoints, start, end } = getTerritoryLine(point, points);
      excluded.add(linePoints);
      linePoints.forEach(v => excluded.add(v));
      const coors = getLineCoordinates(start, end, width);
      lines.push(coors);
    }

    TERRITORY_CACHE[color] = [points.length, lines];
  } else {
    lines = TERRITORY_CACHE[color][1];
  }
  console.log(lines);
  // pyglet.gl.glColor4f(*[i/255 for i in color])
  // pyglet.gl.glBegin(pyglet.gl.GL_QUADS)
  // for line in lines:
  //   for coor in line:
  //     pyglet.graphics.glVertex2i(*coor)
  // pyglet.gl.glEnd()
};

exports.batchDraw = (points, color, width = WIDTH) => {
  const halfWidth = Math.round(width / 2);
  console.log('draw', points);
  // pyglet.gl.glColor4f(*[i/255 for i in color])
  // pyglet.gl.glBegin(pyglet.gl.GL_QUADS)
  // for point in points:
  //   square = get_square_coordinates(point, width)
  //   pyglet.graphics.glVertex2i(square[0], square[1])
  //   pyglet.graphics.glVertex2i(square[2], square[3])
  //   pyglet.graphics.glVertex2i(square[4], square[5])
  //   pyglet.graphics.glVertex2i(square[6], square[7])
  // pyglet.gl.glEnd()
};

exports.drawSquare = (point, color, width = WIDTH) => {
  const halfWidth = Math.round(width / 2);
  const coors = getSquareCoordinates(point, halfWidth);
  // pyglet.graphics.draw(4, pyglet.gl.GL_QUADS, ('v2i', coordinates), ('c4B', 4 * color))
};

exports.drawQuadrilateral = (coordinates, color) => {
  // pyglet.graphics.draw(4, pyglet.gl.GL_QUADS, ('v2i', coordinates), ('c4B', 4 * color))
};

exports.drawLine = (point1, point2, color, width = WIDTH) => {
  const [x1, y1] = point1;
  const [x2, y2] = point2;

  const halfWidth = Math.round(width / 2);

  const coordinates = y1 === y2 ? [
      [x1, y1 + width],
      [x1, y1 - width],
      [x2, y2 - width],
      [x2, y2 + width],
    ] : [
      [x1 - width, y1],
      [x1 + width, y1],
      [x2 + width, y2],
      [x2 - width, y2],
    ];

  // pyglet.graphics.draw(4, pyglet.gl.GL_QUADS, ('v2i', coordinates), ('c4B', 4 * color))
};

exports.inPolygon = (x, y, xp, yp) => {
  let c = 0;
  for (let i = 0; i < xp.length; i++) {
    if (
      ((yp[i] <= y && y < yp[i - 1]) || (yp[i - 1] <= y && y < yp[i]))
      &&
      (x > (xp[i - 1] - xp[i]) * (y - yp[i]) / (yp[i - 1] - yp[i]) + xp[i])
    ) {
      c = 1 -c;
    }
  }

  return c;
};

exports.loadImage = (path) => {
  // if path not in IMAGE_CACHE:
  //   base_dir = os.path.dirname(os.path.realpath(__file__))
  //   absolute_path = os.path.join(base_dir, path)
  //   img = pyglet.image.load(absolute_path)
  //   img.anchor_x = round(img.width / 2)
  //   img.anchor_y = round(img.height / 2)
  //   IMAGE_CACHE[path] = img
  //
  // return IMAGE_CACHE[path]
};

exports.drawSquareWithImage = (point, color, imagePath, label = null, width = WIDTH) => {
  drawSquare(point, color, width);
  const [x, y] = point;

  // img = load_image(image_path)
  // sprite = pyglet.sprite.Sprite(img=img, x=x, y=y)
  // sprite.scale = 0.75 * (width / max(sprite.height, sprite.width))
  // sprite.draw()
  //
  // if label is not None:
  //   pyglet.text.Label('{}'.format(label), font_name='Times New Roman',
  //     font_size=round(WIDTH / 7),
  //     color=(95, 99, 104, 255),
  //     x=x + round(WIDTH / 2), y=y + round(WIDTH / 2),
  //     anchor_x='right', anchor_y='top').draw()
};

exports.getRandomCoordinates = () => {
  // x = random.randint(1, X_CELLS_COUNT) * WIDTH - round(WIDTH / 2)
  // y = random.randint(1, Y_CELLS_COUNT) * WIDTH - round(WIDTH / 2)
  // return x, y
  return [255, 128];
};

exports.isIntersect = (p1, p2, width = WIDTH) => {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return Math.abs(x1 - x2) < width && Math.abs(y1 - y2) < width;
};

exports.randomChoose = (choices) => {
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
};
