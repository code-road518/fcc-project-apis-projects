// add title description

d3.select('#container').append('h2')
    .attr('id', 'title')
    .text("Monthly Global Land-Surface Temperature");

const setDes = (from, to, baseT) => {

    d3.select('#container').append('p')
        .attr('id', 'description')
        .text(`${from} - ${to}: base temperature ${baseT}℃`)
}


const getData = async () => {
    const res = await d3.json('./data/global-temperature.json')

    return res
}



const addChart = async () => {

    const res = await getData()
    const data = res.monthlyVariance
    const minY = d3.min(data, d => d.year)
    const maxY = d3.max(data, d => d.year)
    setDes(minY, maxY, res.baseTemperature)

    const margin = { top: 30, right: 30, bottom: 30, left: 60 }

    const width = 5 * Math.ceil(data.length / 12);
    const height = 33 * 12

    const svg = d3.select('#container').append('svg')
        .attr('width', width).attr('height', height)
        .attr('background', '#f34')


    const xScale = d3.scaleBand()
        .domain(data.map(function (val) {
            return val.year;
        }))
        .range([margin.left, width - margin.right])

    const xAxis = d3.axisBottom(xScale)
        .tickValues(
            xScale.domain().filter(function (year) {
                // set ticks to years divisible by 10
                return year % 10 === 0;
            })
        ).tickSize(10, 1)

    svg.append('g').attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(xAxis)
        .append('text')
        .text('Years')
        .style('text-anchor', 'middle')
        .attr('transform', 'translate(' + width / 2 + ',' + 3 * 14 + ')')
        .attr('fill', 'black');

    const ytickValues = ['January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December']

    const yScale = d3.scaleBand().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .rangeRound([margin.top, height - margin.bottom])

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(function (d) { return ytickValues[d] })

    svg.append('g').attr('id', 'y-axis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis)


    const tooltip = document.querySelector('#tooltip')

    // data
    svg.append('g').attr('id', 'content-map').selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-month', d => d.month - 1)
        .attr('data-year', d => d.year)
        .attr('data-temp', d => res.baseTemperature + d.variance)
        .attr('x', d => xScale(d.year))
        .attr('y', d => yScale(d.month - 1))
        .attr('width', d => xScale.bandwidth(d.year))
        .attr('height', d => yScale.bandwidth(d.month))
        .attr('fill', d => {
            const color = getColor(res.baseTemperature + d.variance)
            // console.log(color);
            return color
        })
        .on('mouseover', function (event, d) {
            var date = new Date(d.year, d.month);
            const [x, y] = d3.pointer(event, svg)
            const target = event.currentTarget
            target.setAttribute('stroke', '#000')
            var str =
                "<span class='date'>" +
                d3.utcFormat('%Y - %B')(date) +
                '</span>' +
                '<br />' +
                "<span class='temperature'>" +
                d3.format('.1f')(res.baseTemperature + d.variance) +
                '&#8451;' +
                '</span>' +
                '<br />' +
                "<span class='variance'>" +
                d3.format('+.1f')(d.variance) +
                '&#8451;' +
                '</span>';

            tooltip.innerHTML = str
            tooltip.setAttribute('data-year', d.year)
            tooltip.style.left = x + 30 + 'px'
            tooltip.style.top = y - margin.top - margin.bottom - 30 * 2 + 'px'
            tooltip.style.display = 'block'
            tooltip.style.zIndex = 10;
        })
        .on('mouseout', () => {
            tooltip.style.display = 'none'
            tooltip.style.zIndex = -1;

            const target = event.currentTarget
            target.setAttribute('stroke', 'none')
        })

    // legend

    const legendWidth = 340
    const legendHeight = 40

    svg.attr('height', height + 2 * legendHeight)

    const minT = d3.min(data, d => res.baseTemperature + d.variance)
    const maxT = d3.max(data, d => res.baseTemperature + d.variance)

    const legendX = d3.scaleLinear()
        .domain([minT, maxT])
        .range([0, legendWidth]);


    const legendXAxis = d3
        .axisBottom()
        .scale(legendX)
        .tickSize(10, 0)
        .tickValues([2.8,
            3.9,
            5.0,
            6.1,
            7.2,
            8.3,
            9.5,
            10.6,
            11.7,
            12.8])
        .tickFormat(d3.format('.1f'));

    const legend = svg
        .append('g')
        .classed('legend', true)
        .attr('id', 'legend')
        .attr(
            'transform',
            'translate(' +
            margin.left +
            ',' +
            (margin.top + 40 + height + margin.bottom - 2 * legendHeight) +
            ')'
        );

    legend
        .append('g')
        .selectAll('rect')
        .data(
            [2.8,
                3.9,
                5.0,
                6.1,
                7.2,
                8.3,
                9.5,
                10.6,
                11.7,
                12.8]
        )
        .enter()
        .append('rect')
        .style('fill', function (d) {
            return getColor(d);
        })
        .attr('x', d => legendX(d))
        .attr('y', 0)
        .attr('width', 34)
        .attr('height', legendHeight);
    legend
        .append('g')
        .attr('transform', 'translate(' + 0 + ',' + legendHeight + ')')
        .call(legendXAxis);
}

const getColor = (val) => {

    if (val < 2.8) {
        return '#313695'
    } else if (val < 3.9) {
        return '#4575b4'
    } else if (val < 5) {
        return '#74add1'
    } else if (val < 6.1) {
        return '#abd9e9'
    }
    else if (val < 7.2) {
        return '#e0f3f8'
    } else if (val < 8.3) {
        return '#ffffbf'
    } else if (val < 9.5) {
        return '#fee090'
    } else if (val < 10.6) {
        return '#fdae61'
    } else if (val < 11.7) {
        return '#f46d43'
    } else if (val < 12.8) {
        return '#d73027'
    }
    else {
        return '#a50026'
    }
}


addChart()