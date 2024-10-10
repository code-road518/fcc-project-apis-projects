window.addEventListener('DOMContentLoaded', function () {

})
const getGDPData = async () => {
    const response = await fetch('./data/GDP-data.json');
    return await response.json();
}

const tooltip = document.querySelector('#tooltip')
const addSvg = async () => {
    const width = 900
    const height = 600
    const svg = d3.select('#container').append('svg').attr('width', width).attr('height', height).style('background', '#E5E9EC')



    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const res = await getGDPData();
    const dataset = res.data

    // "from_date": "1947-01-01",
    // "to_date": "2015-07-01",
    console.log('res-date', res.from_date, res.to_date)
    const xScale = d3.scaleTime()
        .domain([new Date(res.from_date), new Date(res.to_date)])
        .range([margin.left, width - margin.right])

    console.log('x-scale', xScale(new Date('1947-01-01')))

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => +d[1])])
        .range([height - margin.bottom, margin.top])

    const rectW = width / dataset.length
    svg.selectAll('rect').data(dataset).enter().append('rect')
        .attr('x', d => xScale(new Date(d[0])))
        .attr('y', d => yScale(d[1]))
        .attr('fill', '#38afff')
        .attr('width', rectW)
        .attr('class', 'bar')
        .attr('data-date', d => d[0])
        .attr('data-gdp', d => d[1])
        .attr('height', d => height - margin.bottom - yScale(d[1]))
        .on('mouseover', event => {
            const target = event.currentTarget
            target.setAttribute('opacity', 0.5)
            const [x, y] = d3.pointer(event, svg)

            tooltip.style.opacity = 1
            tooltip.style.left = x + 30 + 'px'

            const date = target.getAttribute('data-date')
            const gdp = target.getAttribute('data-gdp')

            tooltip.setAttribute('data-date', date)
            let html = `
                ${date} <br>
                ${gdp}
            `
            tooltip.innerHTML = html
        })
        .on('mouseout', event => {
            const target = event.currentTarget
            target.setAttribute('opacity', 1)
            tooltip.style.opacity = 0
        })


    //  x 轴
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
        .attr('id', 'x-axis')
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(xAxis);

    // y轴
    const yAxis = d3.axisLeft(yScale);
    svg.append("g")
        .attr('id', 'y-axis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis);
}

addSvg()