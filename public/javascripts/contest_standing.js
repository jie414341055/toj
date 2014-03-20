function getPenalty(st, submit_time) {
	var start = new Date(st);
	var sub = new Date(submit_time);
	return Math.ceil((sub - start)/60000);
}

function get_result(stats, cont) {
	var result = [];
	var len = stats.length;
	var prob_num = cont.problem.length;
	var tmp = [];
	tmp[0] = 0; tmp[1] = 0; tmp[2] = []; 
	for(var i = 0;i < prob_num; ++i)
		tmp[2][i] = 0;
	//[ac, penalty, [0, -1, -3, ]]
	for(var i = 0;i < len; ++i) {
		if(i > 0 && stats[i].username != stats[i-1].username) {
			tmp[3] = stats[i-1].username;
			result.push(jQuery.extend(true, {}, tmp));
			tmp[0] = 0; tmp[1] = 0; tmp[2] = []; tmp[3] = '';
			for(var j = 0;j < prob_num; ++j)
				tmp[2][j] = 0;
		}

		var prob = parseInt(stats[i].nid) - 1001;
		if(stats[i].result == "Accepted") {
			if(tmp[2][prob] == 0) {
				tmp[0] ++;
				tmp[1] += getPenalty(cont.start_time, stats[i].submit_time);
				tmp[2][prob] = 1;
			} else if(tmp[2][prob] < 0) {
				tmp[0] ++;
				tmp[1] += -tmp[2][prob] * 20 + getPenalty(cont.start_time, stats[i].submit_time);
				tmp[2][prob] = -tmp[2][prob] + 1;
			}
		} else {
			tmp[2][prob] --;
		}

		if(i == len - 1) {
			tmp[3] = stats[i].username;
			result.push(jQuery.extend(true, {}, tmp));
		}
	}
	result.sort(function(a, b) {
		if(a[0] == b[0]) return a[1] > b[1];
		else return a[0] < b[0];
	});
	var unum = result.length;
	var table = "<table id='standing' class='table table-hover table-striped table-centered'><thead id='ranking_head'>";
	table += $('#ranking_head').html();
	table += "</thead><tbody id='ranking_body'>";
	for(var i = 0;i < unum; ++i) {
		table += "<tr>";
		table += "<td>" + (i+1+"") + "</td>";
		table += "<td>" + result[i][3] + "</td>";
		table += "<td>" + result[i][0] + "</td>";
		for(var j = 0;j < prob_num; ++j) {
			table += "<td>" + result[i][2][j] + "</td>";
		}
		table += "<td>" + result[i][1] + "</td>";
		table += "</tr>";
	}
	table += "</tbody></table>";
	$('#standing').html(table);
}
