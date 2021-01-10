
$("#polluantContainer").change(function () {
    console.log("tmnyik");
    getProperData($(this).val(), $("#regionButtContainerSelect").val())
        .then(buildChart);
});

$("#regionButtContainerSelect").change(function () {
    getProperData($("#polluantContainer").val(), $(this).val())
        .then(buildChart);
})


function buildChart(entryData) {
    d3.select("#line_chart > *").remove();

    console.log(entryData);
    const chartContainer = d3.select("#line_chart");
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };

    const width = +chartContainer.node().clientWidth - margin.left - margin.right;
    const height = 500//+chartContainer.node().clientHeight - margin.top - margin.bottom;

    const extent = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', (event) => {
            x.range([margin.left, width - margin.right].map(d => event.transform.applyX(d)));
            path.attr('transform', 'translate(' + event.transform.x + ',' + '0) scale(' + event.transform.k + ',1)');
            path.attr("stroke-width", 2 / event.transform.k)

            chart.selectAll(".x-axis").call(xAxis);
        })


    // The Chart
    const chart = chartContainer.append("svg")
        .attr("viewBox", [0, 0, width, height])
        .call(zoom);


    const x = d3.scaleTime()
        .domain(d3.extent(entryData, function (d) { return d.date; }))
        .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
        .domain([0, d3.max(entryData, d => d.value)])
        .range([height - margin.bottom, margin.top]);

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))

    const xAxis = g => g
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

    const line = d3.line()
        .defined(d => !isNaN(d.value))
        .x(d => x(d.date))
        .y(d => y(d.value))


    const gx = chart.append("g")
        .call(xAxis);

    const gy = chart.append("g")
        .call(yAxis);

    const path = chart.append("path")
        .datum(entryData)
        .attr("class", "x-chart")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line(entryData))
    console.log(x);
}


function getProperData(poluant, region) {
    const parseTime = d3.timeParse("%Y/%m/%d");
    console.log("azdazd");
    return d3.csv(/*"./../data/resultat_final.csv"*/"https://raw.githubusercontent.com/azouiaymen/DataViz/main/data/resultat_final.csv").then(function (d) {
        return d.filter((a) => a["region"] == region)
            .map(function (val) {
                return { date: parseTime(val.date), value: parseInt(val[` ${poluant}`]) };
            })
            .sort((a, b) => a.date > b.date);
    })
}

function getRegions() {
    return d3.csv(/*"./../data/resultat_final.csv"*/"https://raw.githubusercontent.com/azouiaymen/DataViz/main/data/resultat_final.csv").then(function (d) {
        return d;
    }).then(function (deez) {
        return new Set(deez.map(item => item["region"]))
    });
}
function displayRegions(regions) {
    regions.forEach((reg) => {
        $("#regionButtContainerSelect").append(`<option id="rb${reg}" value="${reg}">${reg}</option>`)
    });

}

var gettingRegions = getRegions().then(displayRegions);
var data = getProperData("pm25", "alpes-cote-dazur-est");
var gettingData = data.then(buildChart)

