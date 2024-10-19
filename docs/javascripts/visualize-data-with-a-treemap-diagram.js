
const getData = async (path = '') => {
    try {
        const res = await fetch(`./data/${path}`)
        return res.json()
    } catch (error) {
        return Promise.reject(error)
    }
}

const addChart = async () => {

    const width = 1100;
    const height = 700;

    const DATASETS = {
        videogames: {
            TITLE: 'Video Game Sales',
            DESCRIPTION: 'Top 100 Most Sold Video Games Grouped by Platform',
            FILE_PATH: './video-game-sales-data.json'
        },
        movies: {
            TITLE: 'Movie Sales',
            DESCRIPTION: 'Top 100 Highest Grossing Movies Grouped By Genre',
            FILE_PATH: './movie-data.json'
        },
        kickstarter: {
            TITLE: 'Kickstarter Pledges',
            DESCRIPTION: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
            FILE_PATH: './kickstarter-funding-data.json'
        }
    };
    var urlParams = new URLSearchParams(window.location.search);

    const DEFAULT_DATASET = 'videogames';
    const DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET];

    document.getElementById('title').innerHTML = DATASET.TITLE;
    document.getElementById('description').innerHTML = DATASET.DESCRIPTION;


    const data = await getData(DATASET.FILE_PATH)

    // Specify the color scale.
    const color = d3.scaleOrdinal(data.children.map(d => d.name), d3.schemeTableau10);

    const root = d3.treemap()
        // .tile(tile) // e.g., d3.treemapSquarify
        .size([width, height])
        .padding(1)
        .round(true)

        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

    const svg = d3.select('#container')
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const leaf = svg.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    const format = d3.format(",d");

    const tooltip = document.getElementById('tooltip');


    leaf.append("rect")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr('class', 'tile')
        .attr("fill-opacity", 0.6)
        .attr('data-name', d => {
            return d.data.name
        })
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .on('mouseover', (event, d) => {
            const [x, y] = d3.pointer(event, svg)

            tooltip.style.opacity = 1
            tooltip.style.zIndex = 1
            tooltip.style.left = x + 20 + 'px'
            tooltip.style.top = y - 100 + 'px'
            tooltip.setAttribute('data-value', d.data.value)
            const str = ` ${d.data.name}<br>${d.data.category}<br>${format(d.value)}`

            tooltip.innerHTML = str
        })
        .on('mouseout', d => {
            tooltip.style.opacity = 0
            tooltip.style.zIndex = -1

        })


    leaf.append("text")
        .attr("clip-path", d => d.clipUid)
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g).concat(format(d.value)))
        .join("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .text(d => d);


    var legend = d3.select('#legend');
    var legendWidth = +legend.attr('width');
    const LEGEND_OFFSET = 10;
    const LEGEND_RECT_SIZE = 15;
    const LEGEND_H_SPACING = 150;
    const LEGEND_V_SPACING = 10;
    const LEGEND_TEXT_X_OFFSET = 3;
    const LEGEND_TEXT_Y_OFFSET = -2;
    var legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

    const categories = data.children.map(d => d.name)

    var legendElem = legend
        .append('g')
        .attr('transform', 'translate(60,' + LEGEND_OFFSET + ')')
        .selectAll('g')
        .data(categories)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            return (
                'translate(' +
                (i % legendElemsPerRow) * LEGEND_H_SPACING +
                ',' +
                (Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
                    LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) +
                ')'
            );
        });

    legendElem
        .append('rect')
        .attr('width', LEGEND_RECT_SIZE)
        .attr('height', LEGEND_RECT_SIZE)
        .attr('class', 'legend-item')
        .attr('fill', function (d) {
            return color(d);
        });
    legendElem
        .append('text')
        .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
        .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
        .text(function (d) {
            return d;
        });
}


addChart()

