
function analyticsBridge__fireEvent(event) {

    if(dataLayer) {
      dataLayer.push({'event' : event});
    }

};
