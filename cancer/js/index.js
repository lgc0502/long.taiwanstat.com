


var margin = { top: 20, right:80, bottom: 30, left: 50};

var width = 960 - margin.left - margin.right;

var height = 500 - margin.top - margin.bottom;



var x = d3.time.scale()
					.range([ 0, width]);

var y = d3.scale.linear()
					.range([ height, -10]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
							.scale(x)
							.orient('bottom')
							.tickFormat(d3.format("4.0f"))

var yAxis = d3.svg.axis()
							.scale(y)
							.orient("left");

var line = d3.svg.line()
						.interpolate("basis")
						.x( function (d, i){
							return x(i+1996);
						})
						.y(function (d){
							return y(d);
						});

var svg = d3.select(".graph").append("svg")
					.attr("width", width + margin.left + margin.right )
					.attr("height", height + margin.top + margin.bottom )
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//input data
d3.csv("../data/cancer_happen_rate.csv", function(data){
	console.log(data);

  var date_range = [];
  for(i = 0; i < data.length; i++){
    if( date_range.indexOf(data[i]['年度']) <0){
      date_range.push(data[i]['年度'])
    }
  }

	//get [ [yaer][sex][cancer][county] [happen rate every year]]
	// 3*23 42

  var categories = ['性別', '縣市', '癌別'];

  var category_combinations = [];     //stores all category combinations


  for(i = 0; i< data.length; i++){    //get all combinations
  	var temp = [];
  	if(data[i]['年度'] == '1996'){
    	temp.push(data[i]['性別']);
    	temp.push(data[i]['縣市']);
    	temp.push(data[i]['癌別']);

    	category_combinations.push(temp);
    }
		
  }

  // console.log(category_combinations)



  //get yearly data for each categoryies
  for(j = 0; j < category_combinations.length; j++){
    for(i = 0; i < data.length; i++){					//change data length here ************************************
      if(data[i]['性別'] ==category_combinations[j][0] && data[i]['縣市'] ==category_combinations[j][1] && data[i]['癌別'] ==category_combinations[j][2]){
          category_combinations[j].push(+data[i]['WHO2000年人口標準化發生率(每10萬人口)']);
      }
    }
  }

  // console.log(category_combinations)				//left off here: try to plot only complete data 20 

  var complete_category_combinations= [];         //elminate incomplete data
  for(i = 0; i <category_combinations.length; i++){
  	if(category_combinations[i].length==20){
  		complete_category_combinations.push(category_combinations[i]);
  		// console.log(temp);
  	}
  }

  console.log(complete_category_combinations)

  for(i = 0; i < complete_category_combinations.length; i ++){
   if(complete_category_combinations[i].length!=20){
     console.log(complete_category_combinations[i]);
   }
  }



  var gender_type = [];
  for(i = 0; i < complete_category_combinations.length; i++){
    if(gender_type.indexOf(complete_category_combinations[i][0]) <0)
      gender_type.push(complete_category_combinations[i][0]);

  }

  // console.log(gender_type);


  //get all cancer type for form
  var county_type = [];
  for(i = 0; i < complete_category_combinations.length; i++){
    if(county_type.indexOf(complete_category_combinations[i][1]) <0)
      county_type.push(complete_category_combinations[i][1]);

  }


  var cancer_type = [];
  for(i = 0; i < complete_category_combinations.length; i++){
    if(cancer_type.indexOf(complete_category_combinations[i][2]) <0)
      cancer_type.push(complete_category_combinations[i][2]);
  }


  d3.select('#highlight_form')
    .append('form')
    .append('select')
    .attr('id', 'gender_form')
    .selectAll('option')
    .data(gender_type)  
    .enter()
    .append('option')
    .text( function(d){
      return d;
    })


  d3.select('#highlight_form')
    .append('form')
    .append('select')
    .attr('id', 'county_form')
    .selectAll('option')
    .data(county_type)  
    .enter()
    .append('option')
    .text( function(d){
      return d;
    })


  //cancer type form 
  d3.select('#highlight_form')
    .append('form')
    .append('select')
    .attr('id', 'cancer_form')
    .selectAll('option')
    // .data(cancer_type.reverse())
    .data(cancer_type)  //temp
    .enter()
    .append('option')
    .text( function(d){
      return d;
    })




  // debugger;

  //merge first 3 elements
  var category_combinations_merged = category_combinations;

  for(i = 0; i < category_combinations_merged.length; i++){
    var categories_string = category_combinations_merged[i].splice(0, 3).join("-");

    category_combinations_merged[i].unshift(categories_string);
  }

  // for(i = 0; i < category_combinations_merged.length; i ++){
  // 	if(category_combinations_merged[i].length!=18){
  // 		console.log(category_combinations_merged[i]);
  // 	}
  // }

  var cases = category_combinations_merged.map( function(d){    //data process completed
  	return {
  		name: d[0],
  		values: d.slice(1, d.length)
  		
  	}
  });

  // console.log(cases);  //total 2211 arrays

  // for(i = 0; i < cases.length; i ++){
  // 	if(cases[i].values.length!=17){
  // 		console.log(cases[i]);
  // 	}
  // }


  x.domain([1995.8, 2012]);

  // x.domain(date_range);

  y.domain([
  	-5, 
  	d3.max(cases, function(c){
  		return d3.max(c.values)
  	})

  ])



  svg.append("g")
  		.attr("class", "x axis")
  		.attr("transform", "translate(0," + height + ")")
  		.call(xAxis);

  svg.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
	.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', 6)
		.attr('dy', '.71em')
		.style('text-anchor', 'end')
		.text('rate');


	var recorded_color;
	var recorded_op;
	var recorded_width;

  var name = svg.selectAll(".name")
							.data(cases)
							.enter()
							.append("g")
							.attr("class", "name")
							

  name.append("path")
  		.attr("class", "line")
  		.attr("id", function(d){
  			return d.name;
  		})

  		.attr("d", function(d){
  			return line(d.values);
  		})

  		.style("stroke", "#1f77b4")
  		.style("opacity", "0.2")
  		.style("stroke-width", "2.5px")

  		.on("mouseover", function(d){
  			recorded_color = d3.select(this).style("stroke");
  			recorded_op = d3.select(this).style("opacity");
  			recorded_width = d3.select(this).style("stroke-width");
  			
  			d3.select(this)
  				.style("stroke", "red")
  				.style("opacity", "1")
  				.style("stroke-width", "5px");

  			d3.select('#gender').html(d.name.split(',')[0]);
        d3.select('#county').html(d.name.split(',')[1]);
        d3.select('#cancer').html(d.name.split(',')[2]);
        d3.select('#oldest_happen_rate').html('1996: ' + d.values[0]);

        var newest_year = 1993 + d.values.length+2;
        d3.select('#newest_happen_rate').html( newest_year + ": " +d.values[d.values.length-1]);



  		})

  		.on("mouseleave", function(){
  			d3.select(this)
  				.style("stroke", recorded_color)
  				.style("opacity", recorded_op)
  				.style("stroke-width", recorded_width);

  			d3.select('#gender').html(null);
        d3.select('#county').html(null);
        d3.select('#cancer').html(null);
        d3.select('#oldest_happen_rate').html(null);
        d3.select('#newest_happen_rate').html(null);

  		})




  function update_hightlight(){

  
    d3.selectAll('.line')
  		.style("stroke", "#1f77b4")
  		.style("opacity", "0.2")
  		.style("stroke-width", "2.5px");


    var sex_input = document.getElementById("gender_form");
    var selected_sex = sex_input.options[sex_input.selectedIndex].text;

    var county_input = document.getElementById("county_form");
    var selected_county = county_input.options[county_input.selectedIndex].text;

    var cancer_input = document.getElementById("cancer_form");
    var selected_cancer = cancer_input.options[cancer_input.selectedIndex].text;

    var combined_input = selected_sex + "-"+ selected_county + "-" +selected_cancer;


    d3.select("#"+combined_input)
    		.each( function(d){
	    		
	    		d3.selectAll(".line").sort(function (a, b) { 
	              if (a.name != d.name) return -1;               
	              else return 1;                             
	            });
	    	})
	    	.style('stroke', 'red')
        .style("opacity", "1")
      	.style("stroke-width", "10px");

    d3.select('#selected_gender').html(selected_sex);
    d3.select('#selected_county').html(selected_county);
    d3.select('#selected_cancer').html(selected_cancer);

    var result = $.grep(cases, function(e){ return e.name == combined_input; });

    // console.log(result)
    d3.select('#selected_oldest_happen_rate').html('1996: ' + result[0].values[0]);

    var newest_year = 1993 + result[0].values.length+2;
    d3.select('#selected_newest_happen_rate').html( newest_year + ": " +result[0].values[result[0].values.length-1]);

  }

  update_hightlight();     // initial highlight

  d3.select('#highlight_form').on('change', function(){
  	update_hightlight();
  });



	// debugger;



}) //data file close

