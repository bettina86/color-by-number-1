$MINBOUNDARY = 200;

var topN = function(data, n) {
	var datum;
	var colors = {};
	var i = 0;
	var str = "";
	while(i < data.length) {
		datum = data[i];
		str += Math.min(Math.round(datum / 2) * 2, 255);

		switch(i % 4) {
			case 0:
			case 1:
			case 2:
				str += " ";
				break;
			case 3:
				colors[str] = (colors[str] || colors[str] == 0) ? colors[str] + 1 : 0;
				str = "";
				break;
		}

		i += 1;
	}

	var sorted = Object.keys(colors).sort(function(a,b) { return colors[b] - colors[a] } );
	var top = [sorted[0]];

	i = 0;
	var acceptable;
	while(top.length < n && i < sorted.length) {
		acceptable = true;
		top.forEach(function(color) {
			if(distance(color.split(" "), sorted[i].split(" ")) < 26) {
				acceptable = false;
				return;
			}
		})

		if(acceptable) {
			top.push(sorted[i]);
		}

		i += 1;
	}

	return top;
};

var distance = function(p1, p2) {
	p1 = [parseInt(p1[0]), parseInt(p1[1]), parseInt(p1[2])];
	p2 = [parseInt(p2[0]), parseInt(p2[1]), parseInt(p2[2])];

	var d1 = Math.pow(p1[0] - p2[0], 2);
	var d2 = Math.pow(p1[1] - p2[1], 2);
	var d3 = Math.pow(p1[2] - p2[2], 2);
	return Math.sqrt(d1 + d2 + d3);
}

var closest = function(start, data, colors) {
	r = data[start];
	g = data[start + 1];
	b = data[start + 2];
	a = data[start + 3];

	best = colors[0];
	var i = 1;
	while(i < colors.length) {
		if(distance([r,g,b], colors[i].split(" ")) < distance([r,g,b], best.split(" "))) {
			best = colors[i];
		}
		i += 1;
	}

	return best.split(" ").join(",");
};

var paintNextColor = function(parsedData, top) {
	var i = 0;
	var boundary = [];
	var x;
	var y;

	while(i < parsedData.length) {
		if(parsedData[i][1] == top[top.length - 1].split(" ").join()) {
			x = i % 300;
			y = Math.floor(i / 300);
			ctx.beginPath();
			ctx.fillStyle = "rgba("+ parsedData[i][1] + ")";
			ctx.arc(x,
							y,
							2,
							0,
							Math.PI * 2,
							true);
			ctx.fill();

			var rgb = parsedData[i][1];
			var topWrong = (rgb !== above(parsedData, i, 300));
			var bottomWrong = (rgb !== below(parsedData, i, 300));
			var leftWrong = (rgb !== left(parsedData, i, 300));
			var rightWrong = (rgb !== right(parsedData, i, 300));

			if(topWrong || bottomWrong || leftWrong || rightWrong) {
				parsedData[i][0] = true;
			}
		
		}

		i += 1;
	}

	top.pop();
}

var rgbSpaces = function(data, start) {
	return data[start] + " " + data[start + 1] + " " + data[start + 2];
}

var rgbCommas = function(data, start) {
	return data[start] + "," + data[start + 1] + "," + data[start + 2];
}

var above = function(parsedData, start, width) {
	return parsedData[start - width] ? parsedData[start - width][1] : "0,0,0,255";
}

var below = function(parsedData, start, width) {
	return parsedData[start + width] ? parsedData[start + width][1] : "0,0,0,255";
}

var left = function(parsedData, start, width) {
	return parsedData[start - 1] ? parsedData[start - 1][1] : "0,0,0,255";
}

var right = function(parsedData, start, width) {
	return parsedData[start + 1] ? parsedData[start + 1][1] : "0,0,0,255";
}

// var fillBoundary = function(boundary, width) {
// 	var i = 0;
// 	var x;
// 	var y;

// 	while(i < boundary.length) {
// 		x = boundary[i][0] % width;
// 		y = Math.floor(boundary[i][0] / width);
// 		ctx.beginPath();
// 		ctx.fillStyle = "rgba(0,0,0,1)";
// 		ctx.arc(x,
// 						y,
// 						0.5,
// 						0,
// 						Math.PI * 2,
// 						true);
// 		ctx.fill();

// 		i += 1;
// 	}
// };

var fillBoundary = function(parsedData, width) {
	var i = 0;
	var x;
	var y;

	while(i < parsedData.length) {
		if(parsedData[i][0]) {
			x = i % width;
			y = Math.floor(i / width);
			ctx.beginPath();
			ctx.fillStyle = "rgba(0,0,0,1)";
			ctx.arc(x,
							y,
							0.5,
							0,
							Math.PI * 2,
							true);
			ctx.fill();

		}
		i += 1;
	}
}

var deleteSmallClusters = function(parsedData, width) {
	var sideWidth = 20;
	var topLeft = [0, 0];
	var square;

	while(topLeft[1] < parsedData.length / width) {
		while(topLeft[0] < width) {
			square = squareBoundary(sideWidth, topLeft, width);
			if(!intersectsBoundary(square, parsedData)) {
				clearInterior(topLeft, sideWidth, width, parsedData);
			}
			topLeft[0] += 1;
		}

		topLeft[1] += 1;
		topLeft[0] = 0;
	}
};

var squareBoundary = function(side, topLeft, width) {
	var boundary = [];
	var i = 0;
	while(i < side) {
		// in the form (x) + width * (y)
		boundary.push((topLeft[0]) + width * (topLeft[1] + i));
		boundary.push((topLeft[0] + i) + width * (topLeft[1] + side));
		boundary.push((topLeft[0] + side) + width * (topLeft[1] + side - i));
		boundary.push((topLeft[0] + side - i) + width * (topLeft[1]));
		i += 1;
	}
	return boundary;
	//TODO: You should probably write a function that moves a square
	//      rather than creating a new one every time. Time + memory.
};

var intersectsBoundary = function(square, parsedData) {
	var i = 0;
	while(i < square.length) {
		if(parsedData[square[i]] && parsedData[square[i]][0]) {
			return true;
		}
		i += 1;
	}
	return false;
};

var clearInterior = function(topLeft, sideWidth, width, parsedData) {
	var pos = topLeft[0] + width * topLeft[1];
	var color = parsedData[pos][1];
	var i = 0;
	var j;
	var intPos;
	while(i < sideWidth) {
		while(j < sideWidth) {
			intPos = pos + i + width * j;
			if(parsedData[intPos]) {
				parsedData[intPos][0] = false;
				parsedData[intPos][1] = color;
			}
			j += 1;
		}
		
		i += 1;
		j = 0;
	}
};

var populateParsedData = function(parsedData, rawData, top) {
	var best;
	var start;
	var i = 0;
	while(i < rawData.length / 4) {
		start = i * 4;
		best = closest(i * 4, rawData, top);
		parsedData.push([false, best]);

		i += 1;
	}
};
