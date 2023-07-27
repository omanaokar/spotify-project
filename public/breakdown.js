function genreBreakdown(json_payload) {
    var header = '';
    console.log(json_payload)
    var body = '<div><div class="text-center"><!-- <h1 class="fs-1 fw-bolder text-uppercase text-center">Genre Breakdown</h1> --><img src=" http://192.168.29.110:8080/title.png" class="img-fluid" alt="GENRE BREAKDOWN"></div><div><p class="fs-3 text-center text-light" id="output">' + JSON.stringify(json_payload) + '</p></div><script src="/breakdown.js"></script><script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>';
  
    // concatenate header string
    // concatenate body string
  

    return '<!DOCTYPE html>'
         + '<html><head>' + header + '</head><body>' + body + '</body></html>';
  };

export default genreBreakdown