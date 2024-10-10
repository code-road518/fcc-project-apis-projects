
const getData = async () => {
    const result = await fetch('./data/cyclist-data.json')

    return await result.json()
}


const addChart = async () => {

    const tooltip = document.querySelector('#tooltip')

    //    用d3.js创建散点图
    const width = 900
    const height = 500
    const margin = { top: 20, right: 30, bottom: 30, left: 40 }

    const svg = d3.select('#container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    const dataset = await getData()
    dataset.forEach(item => {
        const time = item.Time
        const m = time.split(':')[0]
        const s = time.split(':')[1]

        const date = new Date()
        date.setMinutes(m)
        date.setSeconds(s)

        item.Time = date
    })
    const min = d3.min(dataset, d => d.Year - 1)
    const max = d3.max(dataset, d => d.Year + 1)
    console.log(min, max)
    const xScale = d3.scaleLinear()
        .domain([min, max])
        .range([margin.left, width - margin.right])
    const yScale = d3.scaleTime()
        .domain(d3.extent(dataset, d => d.Time))
        .range([margin.top, height - margin.bottom])


    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'))
    svg.append("g")
        .attr('id', 'x-axis')
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(xAxis)
        .attr('x', width)


    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%M:%S'))
    svg.append("g")
        .attr('id', 'y-axis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis);

    svg.selectAll('circle').data(dataset)
        .join('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.Year))
        .attr('cy', d => yScale(d.Time))
        .attr('r', 6)
        .attr('fill', d => d.Doping ? '#E31A1C' : '#42b983')
        .attr('data-xvalue', d => d.Year)
        .attr('data-yvalue', d => d.Time)
        .on('mouseover', (event, d) => {
            const target = event.currentTarget
            const [x, y] = d3.pointer(event, svg)
            tooltip.style.left = x + 10 + 'px'
            tooltip.style.top = y - margin.top - margin.bottom + 'px'

            tooltip.setAttribute('data-year', d.Year)

            const timeFormat = d3.timeFormat('%M:%S')

            tooltip.innerHTML = `
                ${d.Name}: ${d.Nationality}<br>
                Year:${d.Year}, Time:${timeFormat(d.Time)}<br>
                 ${d.Doping ? 'Doping:' + d.Doping : ''}

            `
            tooltip.style.opacity = 1
            tooltip.style.zIndex = 1
        })
        .on('mouseout', () => {
            tooltip.style.opacity = 0
            tooltip.style.zIndex = -1
        })


    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('width', 150)
        .attr('font-size', '.75em')
        .attr('transform', `translate(${width - margin.right}, ${(height - margin.bottom) / 2})`)

    const legendLabel1 = legend.append('g')
        .attr('class', 'legend-label')
        .attr('transform', `translate(0, -10)`)

    legendLabel1.append('text')
        .text('No doping allegations')
        .attr('text-anchor', 'end')

    legendLabel1.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', 10)
        .attr('y', -10)
        .attr('fill', '#42b983')


    const legendLabel2 = legend.append('g')
        .attr('class', 'legend-label')
        .attr('transform', `translate(0, 10)`)

    legendLabel2.append('text')
        .text('Riders with doping allegations')
        .attr('text-anchor', 'end')

    legendLabel2.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', 10)
        .attr('y', -10)
        .attr('fill', '#E31A1C')
}

addChart()