    function updateSlider(slideAmount) {
        var sliderDiv = document.getElementById("sliderSelectedDate");
        sliderDiv.innerHTML = slideAmtToDate(slideAmount);
    }

    function slideAmtToDate(slideAmount) {
    	slideAmount = parseInt(slideAmount)

    	var month;
    	var day = slideAmount + 4; 	// four is offset to account for April 5
    	if (day <= 30) {
    		month = "Apr";  		// 26 days inclusive between Apr 5 and 30
    	} else if (day <= 61) {
    		month = "May";  		// 31 days in May
    		day -= 30;
    	} else if (day <= 91) {
    		month = "Jun";  		// 30 days in June
    		day -= 61;
    	} else if (day <= 122) {
    		month = "Jul";  		// 31 days in July
    		day -= 91;
    	} else if (day <= 153) {
    		month = "Aug";  		// 31 days in August
    		day -= 122;
    	} else if (day <= 183) {
    		month = "Sept"; 		// 30 days in September
    		day -= 153;
    	} else {
    		month = "Oct";  		// last day Oct 4th
    		day -= 183 ;
    	}

    	return month +  " " + day;
    }