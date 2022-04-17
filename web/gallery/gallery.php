<!-- gallery/gallery.php
gallery PHP script
checks for AJAX GET request, scans directory and echoes JSON encoded image array
adapted from formulation by Sabine Rosenberg
 -->

 <?php
// generic check for GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET'){
  // scan upload directory for files, sort in descending order, cull unwanted incidental files by array substraction
  $imagesToSend = array_diff(scandir("../upload", 1), array('.','..','.DS_Store'));
  // echo JSON encoded array back
  echo(json_encode($imagesToSend));
}

// helper function...
function str_starts_with ( $haystack, $needle ) {
  return strpos( $haystack , $needle ) === 0;
}
?>
