const DIGIT_CANVAS_SIZE = 320;
const DIGIT_GRID_SIZE = 8;
const DIGIT_K = 5;
const DIGIT_PATH_SAMPLE_COUNT = 32;
const DIGIT_PATH_TEMPLATES = {
    0: [
        [[0.5, 0.1], [0.32, 0.18], [0.22, 0.38], [0.24, 0.64], [0.38, 0.86], [0.58, 0.88], [0.72, 0.68], [0.74, 0.4], [0.64, 0.18], [0.5, 0.1]]
    ],
    1: [
        [[0.42, 0.24], [0.5, 0.12], [0.5, 0.88]]
    ],
    2: [
        [[0.28, 0.24], [0.42, 0.12], [0.64, 0.16], [0.72, 0.32], [0.26, 0.84], [0.72, 0.84]]
    ],
    3: [
        [[0.32, 0.18], [0.45, 0.12], [0.62, 0.14], [0.71, 0.27], [0.56, 0.41], [0.47, 0.45], [0.63, 0.52], [0.73, 0.67], [0.69, 0.84], [0.51, 0.9], [0.33, 0.81], [0.22, 0.68]]
    ],
    4: [
        [[0.64, 0.88], [0.64, 0.12], [0.26, 0.55], [0.74, 0.55]],
        [[0.58, 0.12], [0.26, 0.56], [0.76, 0.56], [0.58, 0.56], [0.58, 0.88]]
    ],
    5: [
        [[0.72, 0.13], [0.42, 0.13], [0.39, 0.46], [0.58, 0.44], [0.71, 0.55], [0.71, 0.74], [0.57, 0.88], [0.35, 0.88], [0.2, 0.78]]
    ],
    6: [
        [[0.67, 0.17], [0.52, 0.13], [0.35, 0.24], [0.26, 0.44], [0.31, 0.66], [0.45, 0.83], [0.63, 0.83], [0.71, 0.68], [0.61, 0.53], [0.43, 0.48], [0.29, 0.51]]
    ],
    7: [
        [[0.24, 0.16], [0.76, 0.16], [0.44, 0.88]]
    ],
    8: [
        [[0.48, 0.11], [0.35, 0.2], [0.35, 0.34], [0.49, 0.43], [0.64, 0.36], [0.64, 0.21], [0.49, 0.11], [0.38, 0.55], [0.38, 0.76], [0.5, 0.87], [0.64, 0.79], [0.64, 0.58], [0.5, 0.46], [0.38, 0.55]]
    ],
    9: [
        [[0.35, 0.31], [0.45, 0.16], [0.62, 0.18], [0.7, 0.34], [0.61, 0.48], [0.42, 0.46], [0.33, 0.35], [0.62, 0.2], [0.62, 0.83]]
    ]
};
const AIRBNB_HISTOGRAM_BINS = 20;
const AIRBNB_SCORE_BANDS = [
    { label: '0.05-0.10', min: 0.05, max: 0.1 },
    { label: '0.10-0.25', min: 0.1, max: 0.25 },
    { label: '0.25-0.50', min: 0.25, max: 0.5 },
    { label: '0.50-0.75', min: 0.5, max: 0.75 },
    { label: '0.75-0.90', min: 0.75, max: 0.9 },
    { label: '0.90-1.00', min: 0.9, max: 1.01 }
];

const digitCanvas = document.getElementById('digit-canvas');
const digitCanvasHint = document.getElementById('digit-canvas-hint');
const digitClearButton = document.getElementById('digit-clear');
const digitSampleButton = document.getElementById('digit-sample');
const digitPrediction = document.getElementById('digit-prediction');
const digitConfidenceLabel = document.getElementById('digit-confidence-label');
const digitConfidenceFill = document.getElementById('digit-confidence-fill');
const digitTop3 = document.getElementById('digit-top3');
const digitProcessedGrid = document.getElementById('digit-processed-grid');
const digitNeighbors = document.getElementById('digit-neighbors');

const gestureCanvas = document.getElementById('gesture-output');
const gestureVideo = document.getElementById('gesture-video');
const gestureOverlay = document.getElementById('gesture-overlay');
const gestureCount = document.getElementById('gesture-count');
const gestureStatus = document.getElementById('gesture-status');
const gestureHand = document.getElementById('gesture-hand');
const gestureVoiceState = document.getElementById('gesture-voice-state');
const gestureStart = document.getElementById('gesture-start');
const gestureStop = document.getElementById('gesture-stop');
const gestureVoice = document.getElementById('gesture-voice');

const flightRoute = document.getElementById('flight-route');
const flightAirline = document.getElementById('flight-airline');
const flightTime = document.getElementById('flight-time');
const flightSeason = document.getElementById('flight-season');
const flightHoliday = document.getElementById('flight-holiday');
const flightOriginWeather = document.getElementById('flight-origin-weather');
const flightDestWeather = document.getElementById('flight-dest-weather');
const flightVerdict = document.getElementById('flight-verdict');
const flightProbability = document.getElementById('flight-probability');
const flightConfidence = document.getElementById('flight-confidence');
const flightProbabilityFill = document.getElementById('flight-probability-fill');
const flightMeta = document.getElementById('flight-meta');
const flightFactors = document.getElementById('flight-factors');

const airbnbThreshold = document.getElementById('airbnb-threshold');
const airbnbThresholdValue = document.getElementById('airbnb-threshold-value');
const airbnbThresholdNote = document.getElementById('airbnb-threshold-note');
const airbnbMetrics = document.getElementById('airbnb-metrics');
const airbnbDrivers = document.getElementById('airbnb-drivers');
const airbnbSelectedCount = document.getElementById('airbnb-selected-count');
const airbnbSelectedShare = document.getElementById('airbnb-selected-share');
const airbnbAverageScore = document.getElementById('airbnb-average-score');
const airbnbSelectedFill = document.getElementById('airbnb-selected-fill');
const airbnbCutoffCopy = document.getElementById('airbnb-cutoff-copy');
const airbnbHistogram = document.getElementById('airbnb-histogram');
const airbnbBands = document.getElementById('airbnb-bands');
const airbnbPresetButtons = document.querySelectorAll('.airbnb-preset');

const crashSubtype = document.getElementById('crash-subtype');
const crashRoadClass = document.getElementById('crash-road-class');
const crashWeather = document.getElementById('crash-weather');
const crashLanes = document.getElementById('crash-lanes');
const crashVehicles = document.getElementById('crash-vehicles');
const crashTime = document.getElementById('crash-time');
const crashMedian = document.getElementById('crash-median');
const crashP90 = document.getElementById('crash-p90');
const crashCount = document.getElementById('crash-count');
const crashRelativeFill = document.getElementById('crash-relative-fill');
const crashRelativeCopy = document.getElementById('crash-relative-copy');
const crashMeta = document.getElementById('crash-meta');
const crashTimeBreakdown = document.getElementById('crash-time-breakdown');
const crashModelMetrics = document.getElementById('crash-model-metrics');

const digitCtx = digitCanvas.getContext('2d');
let digitData = null;
let flightData = null;
let airbnbData = null;
let crashData = null;
let digitDrawing = false;
let digitCurrentStroke = null;
let digitStrokeGroups = [];
let digitUsingSample = false;
let airbnbHistogramBins = [];

let gestureTracker = null;
let gestureMirrorCanvas = null;
let gestureMirrorContext = null;
let gestureVoiceEnabled = true;
let gestureLastSpoken = null;
let gestureLastSpokenAt = 0;
let gestureCamera = null;
let gestureStream = null;

function createPixelGrid(container, totalCells) {
    container.innerHTML = '';
    const cells = [];

    for (let index = 0; index < totalCells; index += 1) {
        const cell = document.createElement('div');
        cell.className = 'pixel-cell';
        container.appendChild(cell);
        cells.push(cell);
    }

    return cells;
}

const processedCells = createPixelGrid(digitProcessedGrid, DIGIT_GRID_SIZE * DIGIT_GRID_SIZE);

function setPixelGrid(cells, vector, color) {
    cells.forEach((cell, index) => {
        const value = vector[index] || 0;
        const opacity = Math.max(0.05, value / 16);
        cell.style.background = `rgba(${color}, ${opacity})`;
    });
}

function formatPercent(value, digits = 1) {
    return `${(value * 100).toFixed(digits)}%`;
}

function formatMinutes(value) {
    const rounded = Math.max(1, Math.round(value));
    const hours = Math.floor(rounded / 60);
    const minutes = rounded % 60;

    if (!hours) {
        return `${minutes} min`;
    }

    if (!minutes) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
}

function quantile(sortedValues, quantileValue) {
    if (!sortedValues.length) {
        return 0;
    }

    const position = (sortedValues.length - 1) * quantileValue;
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.ceil(position);
    const lowerValue = sortedValues[lowerIndex];
    const upperValue = sortedValues[upperIndex] ?? lowerValue;

    if (lowerIndex === upperIndex) {
        return lowerValue;
    }

    return lowerValue + (upperValue - lowerValue) * (position - lowerIndex);
}

function pointDistance(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

function pathLength(points) {
    let total = 0;

    for (let index = 1; index < points.length; index += 1) {
        total += pointDistance(points[index - 1], points[index]);
    }

    return total;
}

function resamplePath(points, sampleCount = DIGIT_PATH_SAMPLE_COUNT) {
    if (!points.length) {
        return [];
    }

    const interval = pathLength(points) / Math.max(sampleCount - 1, 1);
    if (!interval) {
        return Array.from({ length: sampleCount }, () => ({ ...points[0] }));
    }

    const resampled = [{ ...points[0] }];
    let previous = { ...points[0] };
    let accumulated = 0;

    for (let index = 1; index < points.length; index += 1) {
        const current = points[index];
        let segmentLength = pointDistance(previous, current);

        if (!segmentLength) {
            continue;
        }

        while (accumulated + segmentLength >= interval) {
            const ratio = (interval - accumulated) / segmentLength;
            const interpolated = {
                x: previous.x + ratio * (current.x - previous.x),
                y: previous.y + ratio * (current.y - previous.y)
            };

            resampled.push(interpolated);
            previous = interpolated;
            segmentLength = pointDistance(previous, current);
            accumulated = 0;
        }

        accumulated += segmentLength;
        previous = current;
    }

    while (resampled.length < sampleCount) {
        resampled.push({ ...points[points.length - 1] });
    }

    return resampled.slice(0, sampleCount);
}

function normalizeDigitPath(points) {
    const resampled = resamplePath(points);
    const xs = resampled.map((point) => point.x);
    const ys = resampled.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const size = Math.max(maxX - minX, maxY - minY, 1);

    const scaled = resampled.map((point) => ({
        x: (point.x - minX) / size,
        y: (point.y - minY) / size
    }));

    const center = scaled.reduce(
        (accumulator, point) => ({
            x: accumulator.x + point.x / scaled.length,
            y: accumulator.y + point.y / scaled.length
        }),
        { x: 0, y: 0 }
    );

    return scaled.map((point) => ({
        x: point.x - center.x,
        y: point.y - center.y
    }));
}

function normalizedTemplatePath(path) {
    return normalizeDigitPath(path.map(([x, y]) => ({ x, y })));
}

function pathDistanceScore(left, right) {
    let total = 0;

    for (let index = 0; index < left.length; index += 1) {
        total += pointDistance(left[index], right[index]);
    }

    return total / Math.max(left.length, 1);
}

function dominantDigitStrokePath() {
    if (!digitStrokeGroups.length) {
        return null;
    }

    const ranked = digitStrokeGroups
        .filter((stroke) => stroke.length >= 2)
        .map((stroke) => ({
            stroke,
            length: pathLength(stroke)
        }))
        .sort((left, right) => right.length - left.length);

    return ranked[0]?.stroke || null;
}

function recognizeDigitPath() {
    const stroke = dominantDigitStrokePath();
    if (!stroke || stroke.length < 4) {
        return null;
    }

    const normalizedStroke = normalizeDigitPath(stroke);
    const templateDistances = [];

    Object.entries(DIGIT_PATH_TEMPLATES).forEach(([label, variants]) => {
        let bestDistance = Number.POSITIVE_INFINITY;

        variants.forEach((variant) => {
            const distance = pathDistanceScore(normalizedStroke, normalizedTemplatePath(variant));
            bestDistance = Math.min(bestDistance, distance);
        });

        templateDistances.push({ label: Number(label), distance: bestDistance });
    });

    templateDistances.sort((left, right) => left.distance - right.distance);
    const weighted = templateDistances.map((entry) => ({
        label: entry.label,
        weight: 1 / Math.max(entry.distance * entry.distance, 1e-6)
    }));
    const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0) || 1;
    const probabilities = weighted
        .map((entry) => ({
            label: entry.label,
            probability: entry.weight / totalWeight
        }))
        .sort((left, right) => right.probability - left.probability);

    return {
        prediction: probabilities[0]?.label ?? null,
        confidence: probabilities[0]?.probability ?? 0,
        probabilities
    };
}

function drawDigitBoardBackground() {
    digitCtx.fillStyle = '#ffffff';
    digitCtx.fillRect(0, 0, DIGIT_CANVAS_SIZE, DIGIT_CANVAS_SIZE);
}

function setDigitHintVisible(isVisible) {
    digitCanvasHint.style.opacity = isVisible ? '1' : '0';
}

function resetDigitOutput() {
    digitPrediction.textContent = 'Draw 0-9';
    digitConfidenceLabel.textContent = 'Waiting for input';
    digitConfidenceFill.style.width = '0%';
    digitTop3.innerHTML = '';
    digitNeighbors.innerHTML = '';
    setPixelGrid(processedCells, new Array(64).fill(0), '240, 106, 66');
    setDigitHintVisible(true);
}

function resetDigitStrokes() {
    digitCurrentStroke = null;
    digitStrokeGroups = [];
    digitUsingSample = false;
}

function appendDigitStrokePoint(point) {
    if (!digitCurrentStroke) {
        return;
    }

    const lastPoint = digitCurrentStroke[digitCurrentStroke.length - 1];
    if (!lastPoint || pointDistance(lastPoint, point) >= 3) {
        digitCurrentStroke.push(point);
    }
}

function pointerPosition(event) {
    const rect = digitCanvas.getBoundingClientRect();
    const scaleX = DIGIT_CANVAS_SIZE / rect.width;
    const scaleY = DIGIT_CANVAS_SIZE / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

function drawStroke(from, to) {
    digitCtx.lineCap = 'round';
    digitCtx.lineJoin = 'round';
    digitCtx.strokeStyle = '#111111';
    digitCtx.lineWidth = 24;
    digitCtx.beginPath();
    digitCtx.moveTo(from.x, from.y);
    digitCtx.lineTo(to.x, to.y);
    digitCtx.stroke();
}

function normalizeDigitVector(vector, thresholdRatio = 0.08) {
    const peak = Math.max(...vector);
    if (!peak) {
        return null;
    }

    const threshold = peak * thresholdRatio;
    const normalized = vector.map((value) => {
        if (value <= threshold) {
            return 0;
        }

        return ((value - threshold) / Math.max(peak - threshold, 1e-6)) * 16;
    });

    const newPeak = Math.max(...normalized);
    return newPeak ? normalized.map((value) => (value / newPeak) * 16) : null;
}

function recenterDigitVector(vector) {
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    for (let y = 0; y < DIGIT_GRID_SIZE; y += 1) {
        for (let x = 0; x < DIGIT_GRID_SIZE; x += 1) {
            const value = vector[y * DIGIT_GRID_SIZE + x];
            totalWeight += value;
            weightedX += x * value;
            weightedY += y * value;
        }
    }

    if (!totalWeight) {
        return vector;
    }

    const centerX = weightedX / totalWeight;
    const centerY = weightedY / totalWeight;
    const shiftX = Math.round((DIGIT_GRID_SIZE - 1) / 2 - centerX);
    const shiftY = Math.round((DIGIT_GRID_SIZE - 1) / 2 - centerY);

    if (!shiftX && !shiftY) {
        return vector;
    }

    const shifted = new Array(64).fill(0);

    for (let y = 0; y < DIGIT_GRID_SIZE; y += 1) {
        for (let x = 0; x < DIGIT_GRID_SIZE; x += 1) {
            const sourceX = x - shiftX;
            const sourceY = y - shiftY;

            if (sourceX < 0 || sourceX >= DIGIT_GRID_SIZE || sourceY < 0 || sourceY >= DIGIT_GRID_SIZE) {
                continue;
            }

            shifted[y * DIGIT_GRID_SIZE + x] = vector[sourceY * DIGIT_GRID_SIZE + sourceX];
        }
    }

    return shifted;
}

function rasterizeSquareDigit(squareCanvas, inset = 0.9, blur = 0.4) {
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = DIGIT_GRID_SIZE;
    targetCanvas.height = DIGIT_GRID_SIZE;
    const targetCtx = targetCanvas.getContext('2d');
    const targetSide = DIGIT_GRID_SIZE - inset * 2;

    targetCtx.imageSmoothingEnabled = true;
    targetCtx.filter = `blur(${blur}px)`;
    targetCtx.fillStyle = '#ffffff';
    targetCtx.fillRect(0, 0, DIGIT_GRID_SIZE, DIGIT_GRID_SIZE);
    targetCtx.drawImage(squareCanvas, inset, inset, targetSide, targetSide);

    const scaledPixels = targetCtx.getImageData(0, 0, DIGIT_GRID_SIZE, DIGIT_GRID_SIZE).data;
    const vector = new Array(DIGIT_GRID_SIZE * DIGIT_GRID_SIZE).fill(0);

    for (let index = 0; index < vector.length; index += 1) {
        vector[index] = 255 - scaledPixels[index * 4];
    }

    return normalizeDigitVector(recenterDigitVector(vector));
}

function preprocessDigit() {
    const sourceData = digitCtx.getImageData(0, 0, DIGIT_CANVAS_SIZE, DIGIT_CANVAS_SIZE);
    const pixels = sourceData.data;
    let minX = DIGIT_CANVAS_SIZE;
    let minY = DIGIT_CANVAS_SIZE;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < DIGIT_CANVAS_SIZE; y += 1) {
        for (let x = 0; x < DIGIT_CANVAS_SIZE; x += 1) {
            const index = (y * DIGIT_CANVAS_SIZE + x) * 4;
            const value = pixels[index];

            if (value < 245) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX === -1 || maxY === -1) {
        return null;
    }

    const padding = 22;
    const width = Math.max(1, maxX - minX + 1);
    const height = Math.max(1, maxY - minY + 1);
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropWidth = Math.min(DIGIT_CANVAS_SIZE - cropX, width + padding * 2);
    const cropHeight = Math.min(DIGIT_CANVAS_SIZE - cropY, height + padding * 2);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.putImageData(sourceData, -cropX, -cropY);

    const side = Math.max(cropWidth, cropHeight);
    const squareCanvas = document.createElement('canvas');
    squareCanvas.width = side;
    squareCanvas.height = side;
    const squareCtx = squareCanvas.getContext('2d');
    squareCtx.fillStyle = '#ffffff';
    squareCtx.fillRect(0, 0, side, side);
    squareCtx.drawImage(
        cropCanvas,
        Math.floor((side - cropWidth) / 2),
        Math.floor((side - cropHeight) / 2)
    );

    return rasterizeSquareDigit(squareCanvas, 0.9, 0.4);
}

function blurDigitVector(vector) {
    const kernel = [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]
    ];
    const blurred = new Array(64).fill(0);

    for (let y = 0; y < DIGIT_GRID_SIZE; y += 1) {
        for (let x = 0; x < DIGIT_GRID_SIZE; x += 1) {
            let sum = 0;
            let weight = 0;

            for (let ky = -1; ky <= 1; ky += 1) {
                for (let kx = -1; kx <= 1; kx += 1) {
                    const sampleX = x + kx;
                    const sampleY = y + ky;

                    if (sampleX < 0 || sampleX >= DIGIT_GRID_SIZE || sampleY < 0 || sampleY >= DIGIT_GRID_SIZE) {
                        continue;
                    }

                    const kernelWeight = kernel[ky + 1][kx + 1];
                    sum += vector[sampleY * DIGIT_GRID_SIZE + sampleX] * kernelWeight;
                    weight += kernelWeight;
                }
            }

            blurred[y * DIGIT_GRID_SIZE + x] = weight ? sum / weight : 0;
        }
    }

    const peak = Math.max(...blurred);
    return peak ? blurred.map((value) => (value / peak) * 16) : blurred;
}

function remapDigitVector(vector, inset = 0.7) {
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = DIGIT_GRID_SIZE;
    sourceCanvas.height = DIGIT_GRID_SIZE;
    const sourceCtx = sourceCanvas.getContext('2d');
    const imageData = sourceCtx.createImageData(DIGIT_GRID_SIZE, DIGIT_GRID_SIZE);

    for (let index = 0; index < vector.length; index += 1) {
        const value = 255 - Math.round((vector[index] / 16) * 255);
        const offset = index * 4;
        imageData.data[offset] = value;
        imageData.data[offset + 1] = value;
        imageData.data[offset + 2] = value;
        imageData.data[offset + 3] = 255;
    }

    sourceCtx.putImageData(imageData, 0, 0);

    return rasterizeSquareDigit(sourceCanvas, inset, 0.2) || vector;
}

function classifyDigitVector(vector) {
    const distances = [];

    for (let index = 0; index < digitData.vectors.length; index += 1) {
        const sample = digitData.vectors[index];
        let sum = 0;

        for (let offset = 0; offset < sample.length; offset += 1) {
            const diff = sample[offset] - vector[offset];
            sum += diff * diff;
        }

        distances.push({
            distance: Math.sqrt(sum),
            label: digitData.labels[index],
            vector: sample
        });
    }

    distances.sort((left, right) => left.distance - right.distance);
    const neighbors = distances.slice(0, DIGIT_K);
    const weightMap = new Map();
    let totalWeight = 0;

    neighbors.forEach((neighbor) => {
        const weight = 1 / Math.max(neighbor.distance, 1e-6);
        totalWeight += weight;
        weightMap.set(neighbor.label, (weightMap.get(neighbor.label) || 0) + weight);
    });

    const probabilities = [...weightMap.entries()]
        .map(([label, weight]) => ({
            label,
            probability: weight / totalWeight
        }))
        .sort((left, right) => right.probability - left.probability);

    return {
        prediction: probabilities[0]?.label ?? '?',
        confidence: probabilities[0]?.probability ?? 0,
        probabilities,
        neighbors
    };
}

function digitRegionSum(vector, rows, columns) {
    let total = 0;

    rows.forEach((row) => {
        columns.forEach((column) => {
            total += vector[row * DIGIT_GRID_SIZE + column];
        });
    });

    return total;
}

function looksLikeOpenFour(vector) {
    const stats = {
        topBand: digitRegionSum(vector, [0, 1], [1, 2, 3, 4, 5, 6]),
        upperLeft: digitRegionSum(vector, [1, 2, 3], [1, 2]),
        upperRight: digitRegionSum(vector, [1, 2, 3], [5, 6]),
        midBand: digitRegionSum(vector, [3, 4], [2, 3, 4, 5]),
        lowerLeft: digitRegionSum(vector, [5, 6, 7], [0, 1, 2, 3]),
        lowerRight: digitRegionSum(vector, [4, 5, 6], [4, 5, 6, 7]),
        rightColumn: digitRegionSum(vector, [0, 1, 2, 3, 4, 5, 6, 7], [5, 6, 7])
    };

    const classicOpenFour =
        stats.topBand <= 48 &&
        stats.upperLeft >= 32 &&
        stats.upperRight >= 32 &&
        stats.midBand >= 60 &&
        stats.lowerLeft <= 32 &&
        stats.lowerRight >= 48;

    const angledOpenFour =
        stats.topBand <= 32 &&
        stats.upperLeft >= 32 &&
        stats.midBand >= 40 &&
        stats.lowerLeft <= 24 &&
        stats.lowerRight >= 40 &&
        stats.rightColumn >= 40;

    return classicOpenFour || angledOpenFour;
}

function analyzeDigitVector(vector, pathResult = null) {
    const softened = blurDigitVector(vector);
    const softenedTwice = blurDigitVector(softened);
    const compact = remapDigitVector(vector, 1.0);
    const compactSoft = blurDigitVector(compact);
    const variants = [
        { weight: 0.34, vector, result: classifyDigitVector(vector) },
        { weight: 0.18, vector: softened, result: classifyDigitVector(softened) },
        { weight: 0.1, vector: softenedTwice, result: classifyDigitVector(softenedTwice) },
        { weight: 0.23, vector: compact, result: classifyDigitVector(compact) },
        { weight: 0.15, vector: compactSoft, result: classifyDigitVector(compactSoft) }
    ];

    const scores = new Array(10).fill(0);

    variants.forEach((variant) => {
        variant.result.probabilities.forEach((entry) => {
            scores[entry.label] += entry.probability * variant.weight;
        });
    });

    const rawPrediction = Number(variants[0].result.prediction);
    if (looksLikeOpenFour(vector) || looksLikeOpenFour(softenedTwice)) {
        if ([0, 1, 5, 6, 8, 9].includes(rawPrediction)) {
            scores[4] += 0.9;
        } else {
            scores[4] += 0.35;
        }
    }

    if (pathResult?.probabilities?.length) {
        const pathConfidence = pathResult.probabilities[0]?.probability ?? 0;
        const secondPathProbability = pathResult.probabilities[1]?.probability ?? 0;
        const pathMargin = Math.max(0, pathConfidence - secondPathProbability);
        const pathWeight = 1.4 + pathConfidence * 2.2;

        pathResult.probabilities.forEach((entry) => {
            scores[entry.label] += entry.probability * pathWeight;
        });

        if (pathMargin >= 0.08) {
            scores[pathResult.prediction] += 0.9 + pathMargin * 3;
        }
    }

    const total = scores.reduce((sum, value) => sum + value, 0) || 1;
    const probabilities = scores
        .map((score, label) => ({ label, probability: score / total }))
        .filter((entry) => entry.probability > 0.001)
        .sort((left, right) => right.probability - left.probability);

    const winner = probabilities[0]?.label ?? variants[0].result.prediction;
    const bestVariant =
        variants
            .map((variant) => {
                const match = variant.result.probabilities.find((entry) => entry.label === winner);
                return {
                    variant,
                    score: match?.probability ?? 0
                };
            })
            .sort((left, right) => right.score - left.score)[0]?.variant || variants[0];

    return {
        prediction: winner,
        confidence: probabilities[0]?.probability ?? 0,
        probabilities,
        neighbors: bestVariant.result.neighbors,
        displayVector: bestVariant.vector
    };
}

function classifyDigit(vector) {
    return analyzeDigitVector(vector);
}

function renderTopVotes(probabilities) {
    digitTop3.innerHTML = '';

    probabilities.slice(0, 3).forEach((entry) => {
        const row = document.createElement('div');
        row.className = 'top-list-row';
        row.innerHTML = `<span>Digit ${entry.label}</span><strong>${Math.round(entry.probability * 100)}%</strong>`;
        digitTop3.appendChild(row);
    });
}

function renderNeighbors(neighbors) {
    digitNeighbors.innerHTML = '';

    neighbors.forEach((neighbor, index) => {
        const card = document.createElement('article');
        card.className = 'neighbor-card';
        const grid = document.createElement('div');
        grid.className = 'pixel-grid';
        const cells = createPixelGrid(grid, 64);
        setPixelGrid(cells, neighbor.vector, '24, 34, 31');

        const meta = document.createElement('div');
        meta.className = 'neighbor-meta';
        meta.innerHTML = `<span>#${index + 1} digit ${neighbor.label}</span><span>${neighbor.distance.toFixed(2)}</span>`;

        card.appendChild(grid);
        card.appendChild(meta);
        digitNeighbors.appendChild(card);
    });
}

function updateDigitPrediction() {
    const vector = preprocessDigit();

    if (!vector) {
        resetDigitOutput();
        return;
    }

    setDigitHintVisible(false);
    const result = analyzeDigitVector(vector, recognizeDigitPath());
    setPixelGrid(processedCells, result.displayVector, '240, 106, 66');

    digitPrediction.textContent = String(result.prediction);
    digitConfidenceLabel.textContent = `${Math.round(result.confidence * 100)}% confidence`;
    digitConfidenceFill.style.width = `${Math.round(result.confidence * 100)}%`;
    renderTopVotes(result.probabilities);
    renderNeighbors(result.neighbors);
}

function drawSampleDigit() {
    const randomIndex = Math.floor(Math.random() * digitData.vectors.length);
    const vector = digitData.vectors[randomIndex];
    const cellSize = DIGIT_CANVAS_SIZE / DIGIT_GRID_SIZE;
    resetDigitStrokes();
    digitUsingSample = true;

    drawDigitBoardBackground();
    for (let row = 0; row < DIGIT_GRID_SIZE; row += 1) {
        for (let column = 0; column < DIGIT_GRID_SIZE; column += 1) {
            const value = vector[row * DIGIT_GRID_SIZE + column] / 16;
            const color = 255 - Math.round(value * 255);
            digitCtx.fillStyle = `rgb(${color}, ${color}, ${color})`;
            digitCtx.fillRect(column * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    updateDigitPrediction();
}

function initDigitLab() {
    drawDigitBoardBackground();
    resetDigitStrokes();
    resetDigitOutput();

    let lastPoint = null;

    digitCanvas.addEventListener('pointerdown', (event) => {
        if (digitUsingSample) {
            drawDigitBoardBackground();
            resetDigitStrokes();
            resetDigitOutput();
        }

        digitDrawing = true;
        lastPoint = pointerPosition(event);
        digitCurrentStroke = [lastPoint];
        digitStrokeGroups.push(digitCurrentStroke);
        setDigitHintVisible(false);
        drawStroke(lastPoint, lastPoint);
        digitCanvas.setPointerCapture(event.pointerId);
    });

    digitCanvas.addEventListener('pointermove', (event) => {
        if (!digitDrawing) {
            return;
        }

        const nextPoint = pointerPosition(event);
        drawStroke(lastPoint, nextPoint);
        appendDigitStrokePoint(nextPoint);
        lastPoint = nextPoint;
    });

    function endDigitDraw() {
        if (!digitDrawing) {
            return;
        }

        digitDrawing = false;
        appendDigitStrokePoint(lastPoint);
        digitCurrentStroke = null;
        updateDigitPrediction();
    }

    digitCanvas.addEventListener('pointerup', endDigitDraw);
    digitCanvas.addEventListener('pointerleave', endDigitDraw);

    digitClearButton.addEventListener('click', () => {
        drawDigitBoardBackground();
        resetDigitStrokes();
        resetDigitOutput();
    });

    digitSampleButton.addEventListener('click', drawSampleDigit);
}

function routeLabel(route) {
    return `${route.origin} → ${route.destination} · ${route.distance} mi`;
}

function populateSelect(selectElement, options, labelBuilder, valueBuilder = (item) => item.id ?? item.code) {
    selectElement.innerHTML = '';

    options.forEach((option) => {
        const element = document.createElement('option');
        element.value = valueBuilder(option);
        element.textContent = labelBuilder(option);
        selectElement.appendChild(element);
    });
}

function flightScenarioKey() {
    return [
        flightRoute.value,
        flightAirline.value,
        flightTime.value,
        flightSeason.value,
        flightHoliday.value,
        flightOriginWeather.value,
        flightDestWeather.value
    ].join('|');
}

function updateFlightLab() {
    const key = flightScenarioKey();
    const scenario = flightData.scenarios[key];
    const route = flightData.routes.find((item) => item.id === flightRoute.value);
    const airline = flightData.airlines.find((item) => item.code === flightAirline.value);
    const timeBand = flightData.timeBands.find((item) => item.id === flightTime.value);
    const season = flightData.seasons.find((item) => item.id === flightSeason.value);

    if (!scenario || !route || !airline || !timeBand || !season) {
        return;
    }

    const delayed = scenario.prediction === 1;
    const verdict = delayed ? 'Likely Delayed' : 'Likely On Time';
    const probability = Math.round(scenario.probability * 100);
    const confidence = Math.round(scenario.confidence * 100);

    flightVerdict.textContent = verdict;
    flightVerdict.style.color = delayed ? 'var(--digit)' : 'var(--gesture)';
    flightProbability.textContent = `${probability}%`;
    flightConfidence.textContent = `${confidence}%`;
    flightProbabilityFill.style.width = `${probability}%`;
    flightProbabilityFill.style.background = delayed
        ? 'linear-gradient(90deg, var(--digit), #f6a05d)'
        : 'linear-gradient(90deg, var(--gesture), #6ed6c7)';

    const holidayText = scenario.holidayName ? `${scenario.holidayName} travel window` : 'Normal travel week';
    flightMeta.innerHTML = '';

    [
        ['Route', `${route.originCity} to ${route.destinationCity}`],
        ['Airline', airline.name],
        ['Departure', timeBand.label],
        ['Season', season.label],
        ['Context', holidayText],
        ['Threshold', `${Math.round(scenario.threshold * 100)}% delay cutoff`]
    ].forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'meta-row';
        row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
        flightMeta.appendChild(row);
    });

    flightFactors.innerHTML = '';
    scenario.riskFactors.forEach((factor) => {
        const item = document.createElement('li');
        item.textContent = factor;
        flightFactors.appendChild(item);
    });
}

function initFlightLab() {
    populateSelect(flightRoute, flightData.routes, routeLabel);
    populateSelect(flightAirline, flightData.airlines, (item) => item.name, (item) => item.code);
    populateSelect(flightTime, flightData.timeBands, (item) => item.label);
    populateSelect(flightSeason, flightData.seasons, (item) => item.label);
    populateSelect(
        flightOriginWeather,
        flightData.weatherPresets,
        (item) => `${item.label} (${item.severity}/10)`,
        (item) => item.id
    );
    populateSelect(
        flightDestWeather,
        flightData.weatherPresets,
        (item) => `${item.label} (${item.severity}/10)`,
        (item) => item.id
    );

    [
        flightRoute,
        flightAirline,
        flightTime,
        flightSeason,
        flightHoliday,
        flightOriginWeather,
        flightDestWeather
    ].forEach((control) => {
        control.addEventListener('change', updateFlightLab);
    });

    updateFlightLab();
}

function buildAirbnbHistogram(scores) {
    const bins = Array.from({ length: AIRBNB_HISTOGRAM_BINS }, (_, index) => ({
        start: index / AIRBNB_HISTOGRAM_BINS,
        end: (index + 1) / AIRBNB_HISTOGRAM_BINS,
        count: 0
    }));

    scores.forEach((score) => {
        const index = Math.min(
            AIRBNB_HISTOGRAM_BINS - 1,
            Math.floor(Math.max(0, Math.min(score, 0.999999)) * AIRBNB_HISTOGRAM_BINS)
        );
        bins[index].count += 1;
    });

    return bins;
}

function renderAirbnbHistogram(threshold) {
    airbnbHistogram.innerHTML = '';
    const peak = Math.max(...airbnbHistogramBins.map((bin) => bin.count), 1);

    airbnbHistogramBins.forEach((bin) => {
        const bar = document.createElement('div');
        const height = Math.max(12, (bin.count / peak) * 168);
        const midpoint = (bin.start + bin.end) / 2;

        bar.className = `histogram-bar ${midpoint >= threshold ? 'active' : 'inactive'}`;
        bar.style.height = `${height}px`;
        bar.title = `${bin.start.toFixed(2)}-${bin.end.toFixed(2)}: ${bin.count.toLocaleString()} listings`;
        airbnbHistogram.appendChild(bar);
    });
}

function renderAirbnbBandBreakdown(threshold) {
    airbnbBands.innerHTML = '';
    const selectedScores = airbnbData.scores.filter((score) => score >= threshold);

    AIRBNB_SCORE_BANDS.forEach((band) => {
        const count = selectedScores.filter((score) => score >= band.min && score < band.max).length;

        if (!count && threshold > band.max) {
            return;
        }

        const row = document.createElement('div');
        const share = selectedScores.length ? count / selectedScores.length : 0;
        row.className = `top-list-row ${threshold >= band.min && threshold < band.max ? 'is-selected' : ''}`;
        row.innerHTML = `<span>${band.label}</span><strong>${count.toLocaleString()} · ${formatPercent(share)}</strong>`;
        airbnbBands.appendChild(row);
    });

    if (!airbnbBands.children.length) {
        airbnbBands.innerHTML = '<p class="empty-state">No listings clear this threshold.</p>';
    }
}

function updateAirbnbLab() {
    const threshold = Number(airbnbThreshold.value) / 100;
    const selectedScores = airbnbData.scores.filter((score) => score >= threshold);
    const total = airbnbData.scores.length;
    const selectedShare = total ? selectedScores.length / total : 0;
    const averageSelectedScore = selectedScores.length
        ? selectedScores.reduce((sum, score) => sum + score, 0) / selectedScores.length
        : 0;
    const belowThreshold = airbnbData.scores.filter((score) => score < threshold).length;
    const percentileCut = total ? belowThreshold / total : 0;

    airbnbThresholdValue.textContent = `${Math.round(threshold * 100)}%`;
    airbnbThresholdNote.textContent = `${formatPercent(percentileCut)} of scores fall below this cutoff.`;
    airbnbSelectedCount.textContent = selectedScores.length.toLocaleString();
    airbnbSelectedShare.textContent = formatPercent(selectedShare);
    airbnbAverageScore.textContent = selectedScores.length ? formatPercent(averageSelectedScore) : 'n/a';
    airbnbSelectedFill.style.width = `${Math.round(selectedShare * 100)}%`;
    airbnbCutoffCopy.textContent = selectedScores.length
        ? `This keeps the top ${formatPercent(selectedShare)} of the 10,000 scored listings with an average predicted booking-rate score of ${formatPercent(averageSelectedScore)}.`
        : 'No listings clear this cutoff. Lower the threshold to widen the shortlist.';

    renderAirbnbHistogram(threshold);
    renderAirbnbBandBreakdown(threshold);
}

function initAirbnbLab() {
    airbnbHistogramBins = buildAirbnbHistogram(airbnbData.scores);

    const metrics = [
        ['Held-out AUC', airbnbData.metrics.testAuc.toFixed(4)],
        ['Held-out accuracy', formatPercent(airbnbData.metrics.testAccuracy)],
        ['Cross-val AUC', airbnbData.metrics.crossValAuc.toFixed(4)],
        ['Training matrix', `${airbnbData.metrics.trainingRows.toLocaleString()} x ${airbnbData.metrics.featureCount}`],
        ['Competition result', airbnbData.metrics.placement]
    ];

    metrics.forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'top-list-row';
        row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
        airbnbMetrics.appendChild(row);
    });

    airbnbData.drivers.forEach((driver) => {
        const item = document.createElement('li');
        item.textContent = driver;
        airbnbDrivers.appendChild(item);
    });

    airbnbThreshold.addEventListener('input', updateAirbnbLab);
    airbnbPresetButtons.forEach((button) => {
        button.addEventListener('click', () => {
            airbnbThreshold.value = button.dataset.threshold;
            updateAirbnbLab();
        });
    });

    updateAirbnbLab();
}

function populateFilterSelect(selectElement, options, defaultValue = '') {
    selectElement.innerHTML = '';

    const anyOption = document.createElement('option');
    anyOption.value = '';
    anyOption.textContent = 'Any';
    selectElement.appendChild(anyOption);

    options.forEach((option) => {
        const element = document.createElement('option');
        element.value = option;
        element.textContent = option;
        selectElement.appendChild(element);
    });

    selectElement.value = defaultValue;
}

function crashFilters(ignoreTime = false) {
    return {
        subtype: crashSubtype.value,
        roadClass: crashRoadClass.value,
        weather: crashWeather.value,
        lanes: crashLanes.value,
        vehicles: crashVehicles.value,
        time: ignoreTime ? '' : crashTime.value
    };
}

function crashRecordMatches(record, filters) {
    return (
        (!filters.subtype || record.eventSubtype === filters.subtype) &&
        (!filters.roadClass || record.roadClass === filters.roadClass) &&
        (!filters.weather || record.weather === filters.weather) &&
        (!filters.lanes || record.laneBand === filters.lanes) &&
        (!filters.vehicles || record.vehicleBand === filters.vehicles) &&
        (!filters.time || record.timeBand === filters.time)
    );
}

function crashStats(records) {
    const durations = records
        .map((record) => record.durationMinutes)
        .sort((left, right) => left - right);

    return {
        count: durations.length,
        median: quantile(durations, 0.5),
        p90: quantile(durations, 0.9)
    };
}

function renderCrashMeta(filters, stats) {
    crashMeta.innerHTML = '';

    [
        ['Incident type', filters.subtype || 'Any'],
        ['Road class', filters.roadClass || 'Any'],
        ['Weather', filters.weather || 'Any'],
        ['Lanes closed', filters.lanes || 'Any'],
        ['Vehicles', filters.vehicles || 'Any'],
        ['Time window', filters.time || 'Any'],
        ['Sample coverage', formatPercent(stats.count / crashData.records.length)]
    ].forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'meta-row';
        row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
        crashMeta.appendChild(row);
    });
}

function renderCrashTimeBands(records, selectedTime) {
    crashTimeBreakdown.innerHTML = '';

    const grouped = new Map();
    crashData.options.timeBands.forEach((timeBand) => grouped.set(timeBand, []));
    records.forEach((record) => grouped.get(record.timeBand)?.push(record));

    crashData.options.timeBands.forEach((timeBand) => {
        const bandRecords = grouped.get(timeBand) || [];
        if (!bandRecords.length) {
            return;
        }

        const stats = crashStats(bandRecords);
        const row = document.createElement('div');
        row.className = `top-list-row ${selectedTime === timeBand ? 'is-selected' : ''}`;
        row.innerHTML = `<span>${timeBand}</span><strong>${formatMinutes(stats.median)} · n=${stats.count}</strong>`;
        crashTimeBreakdown.appendChild(row);
    });

    if (!crashTimeBreakdown.children.length) {
        crashTimeBreakdown.innerHTML = '<p class="empty-state">No historical incidents match the broader filter set.</p>';
    }
}

function updateCrashLab() {
    const filters = crashFilters();
    const broaderFilters = crashFilters(true);
    const matchingRecords = crashData.records.filter((record) => crashRecordMatches(record, filters));
    const broaderRecords = crashData.records.filter((record) => crashRecordMatches(record, broaderFilters));

    if (!matchingRecords.length) {
        crashMedian.textContent = 'No match';
        crashP90.textContent = 'Try Any';
        crashCount.textContent = '0';
        crashRelativeFill.style.width = '0%';
        crashRelativeCopy.textContent = 'No exact cohort in the trimmed crash history. Relax one or more filters.';
        renderCrashMeta(filters, { count: 0 });
        renderCrashTimeBands(broaderRecords, filters.time);
        return;
    }

    const stats = crashStats(matchingRecords);
    const overallMedian = crashData.overall.median;
    const overallP90 = crashData.overall.p90;
    const slower = stats.median >= overallMedian;
    const relativeRatio = slower ? stats.median / overallMedian : overallMedian / stats.median;

    crashMedian.textContent = formatMinutes(stats.median);
    crashP90.textContent = formatMinutes(stats.p90);
    crashCount.textContent = stats.count.toLocaleString();
    crashRelativeFill.style.width = `${Math.min(100, (stats.median / overallP90) * 100)}%`;
    crashRelativeCopy.textContent = `${relativeRatio.toFixed(2)}x ${slower ? 'slower' : 'faster'} than the trimmed-history median of ${formatMinutes(overallMedian)}.`;

    renderCrashMeta(filters, stats);
    renderCrashTimeBands(broaderRecords, filters.time);
}

function initCrashLab() {
    populateFilterSelect(crashSubtype, crashData.options.eventSubtypes, 'accident');
    populateFilterSelect(crashRoadClass, crashData.options.roadClasses, 'Interstate');
    populateFilterSelect(crashWeather, crashData.options.weather, 'Dry');
    populateFilterSelect(crashLanes, crashData.options.laneBands, '0 closed');
    populateFilterSelect(crashVehicles, crashData.options.vehicleBands, '1 vehicle');
    populateFilterSelect(crashTime, crashData.options.timeBands, 'Midday');

    const modelRows = [
        ['Baseline linear R²', crashData.modelMetrics.baselineLinearR2.toFixed(2)],
        ['Tuned random forest R²', crashData.modelMetrics.tunedRandomForestR2.toFixed(2)],
        ['Gradient boosting R²', crashData.modelMetrics.gradientBoostingR2.toFixed(2)],
        ['XGBoost R²', crashData.modelMetrics.xgboostR2.toFixed(2)],
        ['Trimmed history', `${crashData.overall.count.toLocaleString()} incidents`]
    ];

    modelRows.forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'top-list-row';
        row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
        crashModelMetrics.appendChild(row);
    });

    [
        crashSubtype,
        crashRoadClass,
        crashWeather,
        crashLanes,
        crashVehicles,
        crashTime
    ].forEach((control) => control.addEventListener('change', updateCrashLab));

    updateCrashLab();
}

function gestureSpeak(number) {
    if (!gestureVoiceEnabled || !('speechSynthesis' in window)) {
        return;
    }

    const now = Date.now();
    if (gestureLastSpoken === number && now - gestureLastSpokenAt < 1500) {
        return;
    }

    gestureLastSpoken = number;
    gestureLastSpokenAt = now;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(number));
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
}

function countFingersRepo(landmarks, handLabel) {
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerPips = [3, 6, 10, 14, 18];
    const fingersUp = [];

    if (handLabel === 'Right') {
        fingersUp.push(landmarks[fingerTips[0]].x < landmarks[fingerPips[0]].x ? 1 : 0);
    } else {
        fingersUp.push(landmarks[fingerTips[0]].x > landmarks[fingerPips[0]].x ? 1 : 0);
    }

    for (let index = 1; index < 5; index += 1) {
        fingersUp.push(landmarks[fingerTips[index]].y < landmarks[fingerPips[index]].y ? 1 : 0);
    }

    return fingersUp.reduce((sum, value) => sum + value, 0);
}

function stopGestureCamera() {
    if (gestureCamera && typeof gestureCamera.stop === 'function') {
        gestureCamera.stop();
    }

    if (gestureStream) {
        gestureStream.getTracks().forEach((track) => track.stop());
    }

    gestureCamera = null;
    gestureStream = null;
    gestureCount.textContent = '0';
    gestureHand.textContent = 'None';
    gestureStatus.textContent = 'Camera stopped';
    gestureOverlay.textContent = 'Start the camera to try 1-5 fingers.';

    const context = gestureCanvas.getContext('2d');
    context.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
    context.fillStyle = '#18221f';
    context.fillRect(0, 0, gestureCanvas.width, gestureCanvas.height);
}

async function startGestureCamera() {
    if (!window.Hands || !window.Camera) {
        gestureStatus.textContent = 'MediaPipe failed to load';
        gestureOverlay.textContent = 'Hand tracking library unavailable.';
        return;
    }

    try {
        gestureStatus.textContent = 'Requesting camera…';
        gestureOverlay.textContent = 'Waiting for permission…';

        gestureStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            },
            audio: false
        });

        gestureVideo.srcObject = gestureStream;
        await gestureVideo.play();

        gestureMirrorCanvas = document.createElement('canvas');
        gestureMirrorCanvas.width = 640;
        gestureMirrorCanvas.height = 480;
        gestureMirrorContext = gestureMirrorCanvas.getContext('2d');

        const canvasContext = gestureCanvas.getContext('2d');
        gestureTracker = new window.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        gestureTracker.setOptions({
            selfieMode: false,
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });

        gestureTracker.onResults((results) => {
            canvasContext.save();
            canvasContext.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
            canvasContext.drawImage(results.image, 0, 0, gestureCanvas.width, gestureCanvas.height);

            let currentCount = 0;
            let currentHand = 'None';

            if (results.multiHandLandmarks?.length) {
                results.multiHandLandmarks.forEach((landmarks, index) => {
                    const handLabel = results.multiHandedness?.[index]?.label || 'Right';
                    currentCount = countFingersRepo(landmarks, handLabel);
                    currentHand = handLabel;

                    window.drawConnectors(canvasContext, landmarks, window.HAND_CONNECTIONS, {
                        color: '#6cf7e8',
                        lineWidth: 3
                    });

                    window.drawLandmarks(canvasContext, landmarks, {
                        color: '#f7fbfa',
                        fillColor: '#119c8a',
                        radius: 4
                    });
                });

                gestureOverlay.textContent = 'Hand detected. Try showing 1-5 fingers.';
                gestureHand.textContent = `${currentHand} hand`;
                gestureCount.textContent = String(currentCount);
                gestureStatus.textContent = currentCount > 0 ? 'Tracking live' : 'Hand found, waiting for a clean count';

                if (currentCount >= 1 && currentCount <= 5) {
                    gestureSpeak(currentCount);
                }
            } else {
                gestureCount.textContent = '0';
                gestureHand.textContent = 'None';
                gestureStatus.textContent = 'No hand detected';
                gestureOverlay.textContent = 'Move one hand into frame.';
            }

            canvasContext.restore();
        });

        gestureCamera = new window.Camera(gestureVideo, {
            width: 640,
            height: 480,
            onFrame: async () => {
                gestureMirrorContext.save();
                gestureMirrorContext.clearRect(0, 0, gestureMirrorCanvas.width, gestureMirrorCanvas.height);
                gestureMirrorContext.scale(-1, 1);
                gestureMirrorContext.drawImage(
                    gestureVideo,
                    -gestureMirrorCanvas.width,
                    0,
                    gestureMirrorCanvas.width,
                    gestureMirrorCanvas.height
                );
                gestureMirrorContext.restore();
                await gestureTracker.send({ image: gestureMirrorCanvas });
            }
        });

        await gestureCamera.start();
        gestureStatus.textContent = 'Camera running';
    } catch (error) {
        gestureStatus.textContent = 'Camera unavailable';
        gestureOverlay.textContent = 'Camera access failed or was denied.';
        stopGestureCamera();
    }
}

function initGestureLab() {
    const context = gestureCanvas.getContext('2d');
    context.fillStyle = '#18221f';
    context.fillRect(0, 0, gestureCanvas.width, gestureCanvas.height);

    gestureStart.addEventListener('click', () => {
        if (!gestureStream) {
            startGestureCamera();
        }
    });

    gestureStop.addEventListener('click', stopGestureCamera);

    gestureVoice.addEventListener('click', () => {
        gestureVoiceEnabled = !gestureVoiceEnabled;
        gestureVoiceState.textContent = gestureVoiceEnabled ? 'On' : 'Off';
        gestureVoice.textContent = gestureVoiceEnabled ? 'Toggle Voice' : 'Voice Off';
        window.speechSynthesis?.cancel();
    });
}

async function loadJSON(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
    }

    return response.json();
}

async function boot() {
    try {
        [digitData, flightData, airbnbData, crashData] = await Promise.all([
            loadJSON('data/doodle_knn.json'),
            loadJSON('data/flight_scenarios.json'),
            loadJSON('data/airbnb_booking_scores.json'),
            loadJSON('data/crash_clearance_rows.json')
        ]);

        initDigitLab();
        initGestureLab();
        initFlightLab();
        initAirbnbLab();
        initCrashLab();
    } catch (error) {
        digitPrediction.textContent = 'Load failed';
        digitConfidenceLabel.textContent = 'Data files could not be loaded.';
        flightVerdict.textContent = 'Load failed';
        airbnbSelectedCount.textContent = 'Load failed';
        crashMedian.textContent = 'Load failed';
        gestureStatus.textContent = 'Page boot failed';
        console.error(error);
    }
}

boot();
