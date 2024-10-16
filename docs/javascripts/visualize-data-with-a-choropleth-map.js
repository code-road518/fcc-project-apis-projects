

const width = 960;
const height = 610;

const svg = d3.select('#container').append('svg')
    .attr('width', width)
    .attr('height', height);


const getCountyData = async () => {
    try {

        const res = await fetch('./data/counties.json')
        return res.json();
    } catch (err) {
        return Promise.reject(err)
    }

}
const getFor_user_education = async () => {
    try {
        const res = await fetch('./data/for_user_education.json')
        return res.json();
    } catch (err) {
        return Promise.reject(err)
    }

}


const color = d3
    .scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeGreens[9]);


const addLegend = () => {
    var x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

    var g = svg
        .append('g')
        .attr('class', 'key')
        .attr('id', 'legend')
        .attr('transform', 'translate(0,40)');
    g.selectAll('rect')
        .data(
            color.range().map(function (d) {
                d = color.invertExtent(d);
                if (d[0] === null) {
                    d[0] = x.domain()[0];
                }
                if (d[1] === null) {
                    d[1] = x.domain()[1];
                }
                return d;
            })
        )
        .enter()
        .append('rect')
        .attr('height', 8)
        .attr('x', function (d) {
            return x(d[0]);
        })
        .attr('width', function (d) {
            return d[0] && d[1] ? x(d[1]) - x(d[0]) : x(null);
        })
        .attr('fill', function (d) {
            return color(d[0]);
        });
    g.append('text')
        .attr('class', 'caption')
        .attr('x', x.range()[0])
        .attr('y', -6)
        .attr('fill', '#000')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold');
    g.call(
        d3
            .axisBottom(x)
            .tickSize(13)
            .tickFormat(function (x) {
                return Math.round(x) + '%';
            })
            .tickValues(color.domain())
    )
        .select('.domain')
        .remove();
}

const tooltip = document.querySelector('#tooltip')
const addChart = async () => {
    addLegend()

    const path = d3.geoPath()

    const [us, education] = await Promise.all([getCountyData(), getFor_user_education()])

    const states = topojson.feature(us, us.objects.states)
    const counties = topojson.feature(us, us.objects.counties)

    // 绘制每个州的地图
    // svg.append("path")
    //     .data(topojson.mesh(us, us.objects.states))
    //     .join("path")
    //     .attr("d", path)
    //     .style("stroke", "#fff")
    // .style("fill", function (d) { return "steelblue"; });

    svg.selectAll("path")
        .data(counties.features)
        .join("path")
        .attr('class', 'county')
        .attr('data-fips', function (d) {
            return d.id;
        })
        .attr('data-education', function (d) {
            const result = education.filter(function (obj) {
                return obj.fips === d.id;
            });
            if (result[0]) {
                return result[0].bachelorsOrHigher;
            }
            // could not find a matching fips id in the data
            console.log('could find data for: ', d.id);
            return 0;
        })
        .attr('fill', function (d) {
            var result = education.filter(function (obj) {
                return obj.fips === d.id;
            });
            if (result[0]) {
                return color(result[0].bachelorsOrHigher);
            }
            // could not find a matching fips id in the data
            return color(0);
        })
        // .style("stroke", "#fff")
        .attr("d", path)
        .on('mouseover', function (event, d) {
            const [x, y] = d3.pointer(event, svg)
            tooltip.style.left = x + 10 + 'px'
            tooltip.style.top = y - 10 + 'px'
            tooltip.style.opacity = 0.8

            result = education.filter(function (obj) {
                return obj.fips === d.id;
            });

            tooltip.setAttribute('data-education', result[0].bachelorsOrHigher)

            tooltip.innerHTML = result[0]['area_name'] +
                ', ' +
                result[0]['state'] +
                ': ' +
                result[0].bachelorsOrHigher +
                '%'

        })
        .on('mouseout', function () {
            tooltip.style.opacity = 0
        });




    svg
        .append('path')
        .datum(
            topojson.mesh(us, us.objects.states, function (a, b) {
                return a !== b;
            })
        )
        // .attr('class', 'states')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-linejoin', 'round')
}



addChart()