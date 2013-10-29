<?
require_once('riaConf.php');

$result=false;

$allowedExts	= array("gif", "jpeg", "jpg", "png", "csv", "pdf");
$allowedTypes	= array("image/gif", "image/jpeg", "image/jpg", "image/png", "application/pdf");

$maxFiles=$dev->req->getVar("maxFiles");
$relPath=$dev->req->getVar("relPath");
$absPath=$dev->req->getVar("absPath");
$maxWidth=$dev->req->getVar("maxWidth");
$maxHeight=$dev->req->getVar("maxHeight");
$maxSize=$dev->req->getVar("maxSize");
/*
var_dump($_POST['allowedTypes']);
var_dump($_POST['easyUploadFiles']);
var_dump($_POST['easyUploadIndex']);
die(var_dump($_POST));
*/
//die(is_file("../ria/easyUpload.php"));

$json_response=array();
$json_response["maxFiles"]=$maxFiles;
$json_response["files"]=array();

//die(var_dump($_POST));

if($maxFiles!="" && is_numeric($maxFiles)){
	for($i=0;$i<$maxFiles;$i++){		
		$file=$dev->req->getVar("easyUploadFile_".$i);
		//var_dump($file);
		$fileName="undefined";

		if(is_array($file)){
			//$fileName=uniqid()."_".$file["name"];
			$fileName=$file["name"];
			$temp=explode(".", $file["name"]);
			$extension=strtolower(end($temp));
			
			//echo $relPath.$fileName;
			//die( "aaaaaaaaaa" );
			
			if( in_array($file["type"], $allowedTypes) ){
				if( in_array($extension, $allowedExts) ){
					if( $file["size"]/1024<$maxSize ){
						if( is_file($file["tmp_name"]) && is_dir($relPath) ){
							if(is_file($relPath.$fileName))
								$fileName=uniqid()."_".$fileName;
							$copyResult=false;
							switch ($file["type"]) {
								case 'image/png':
								case 'image/gif':
								case 'image/jpg':
								case 'image/jpeg':
									if($maxHeight!="")
										$copyResult=uploadImage($file,$fileName,$maxWidth,$relPath,$maxHeight);
									else
										$copyResult=uploadImage($file,$fileName,$maxWidth,$relPath);
									$fileResult=$copyResult?0:5;
									break;
								case 'application/pdf':
									//die($file["tmp_name"]." ---- ".$relPath.$fileName);
									if(move_uploaded_file($file["tmp_name"],$relPath.$fileName)){
										$fileResult=0;
									}else{
										if(uploadFile($file, $fileName, $relPath))
											$fileResult=0;
										else $fileResult=5;
									}
									break;
							}
						}else $fileResult=4;
					}else $fileResult=3;
				}else $fileResult=2;
			}else $fileResult=1;
			$json_response["files"][]=array(
				"index"		=> $i,
				"name"		=> $fileName,
				"relPath"	=> $relPath.$fileName,
				"absPath"	=> $absPath.$fileName,
				"result"	=> $fileResult
				/* ********* RESULT ******** */
				/* 	0	=>	Ok				 */
				/* 	1	=>	Type error		 */
				/* 	2	=>	Extension error	 */
				/* 	3	=>	Size error		 */
				/* 	4	=>	File error		 */
				/* 	5	=>	Copy error		 */
				/* ************************* */
			);
		}
		

	}
	$result=true;
}

//FileResult [0=>OK, 1=>Error in type, 2=>Error in ext, 3=>Error size, 4=>Exist file, 5=>Error copying]
if($result)
	die(json_encode($json_response));
else
	die("ERROR");


function uploadFile($file, $fileName, $relPath){
	$result=copy($file["tmp_name"], $relPath.$fileName);
	$result2=false;
	if($result)
		$result2=unlink($file["tmp_name"]);
	return $result && $result2;
	//$contenido=stream_get_contents($fileHandler);
	//die($contenido);
}

function uploadImage($file, $fileName, $maxW, $relPath, $maxH = null){
	$top_offset=0;
	$folder = $relPath;
	$match = "";
	list($width_orig, $height_orig) = getimagesize($file['tmp_name']);
	if($maxH == null){
		if($width_orig < $maxW){
			$fwidth = $width_orig;
		}else{
			$fwidth = $maxW;
		}
		$ratio_orig = $width_orig/$height_orig;
		$fheight = $fwidth/$ratio_orig;

		$blank_height = $fheight;
		$top_offset = 0;
	}else{
		if($width_orig <= $maxW && $height_orig <= $maxH){
			$fheight = $height_orig;
			$fwidth = $width_orig;
		}else{
			if($width_orig > $maxW){
				$ratio = ($width_orig / $maxW);
				$fwidth = $maxW;
				$fheight = ($height_orig / $ratio);
				if($fheight > $maxH){
					$ratio = ($fheight / $maxH);
					$fheight = $maxH;
					$fwidth = ($fwidth / $ratio);
				}
			}
			if($height_orig > $maxH){
				$ratio = ($height_orig / $maxH);
				$fheight = $maxH;
				$fwidth = ($width_orig / $ratio);
				if($fwidth > $maxW){
					$ratio = ($fwidth / $maxW);
					$fwidth = $maxW;
					$fheight = ($fheight / $ratio);
				}
			}
		}
		if($fheight == 0 || $fwidth == 0 || $height_orig == 0 || $width_orig == 0){
			die("FATAL ERROR REPORT ERROR CODE [add-pic-line-67-orig] to <a href='http://www.atwebresults.com'>AT WEB RESULTS</a>");
		}
		if($fheight < 45){
			$blank_height = 45;
			$top_offset = round(($blank_height - $fheight)/2);
		}else{
			$blank_height = $fheight;
		}
	}
	$save=$relPath.$fileName;
	$temp=explode(".", $file["name"]);
	$filetype=strtolower(end($temp));
	$image_p = imagecreatetruecolor($fwidth, $blank_height);
	$white = imagecolorallocate($image_p, 255, 255, 255);
	imagefill($image_p, 0, 0, $white);
	switch($filetype){
		case "gif":
			$image = @imagecreatefromgif($file['tmp_name']);
			break;
		case "jpg":
			$image = @imagecreatefromjpeg($file['tmp_name']);
			break;
		case "jpeg":
			$image = @imagecreatefromjpeg($file['tmp_name']);
			break;
		case "png":
			$image = @imagecreatefrompng($file['tmp_name']);
			break;
	}
	imagecopyresampled($image_p, $image, 0, $top_offset, 0, 0, $fwidth, $fheight, $width_orig, $height_orig);
	switch($filetype){
		case "gif":
			if(!imagegif($image_p, $save)){
				$errorList[]= "PERMISSION DENIED [GIF]";
			}
			break;
		case "jpg":
			if(!imagejpeg($image_p, $save, 100)){
				$errorList[]= "PERMISSION DENIED [JPG]: ".$save;
			}
			break;
		case "jpeg":
			if(!imagejpeg($image_p, $save, 100)){
				$errorList[]= "PERMISSION DENIED [JPEG]";
			}
			break;
		case "png":
			if(!imagepng($image_p, $save, 0)){
				$errorList[]= "PERMISSION DENIED [PNG]";
			}
			break;
	}
	imagedestroy($image_p);
	return isset($errorList) && count($errorList)>0 ? false : true;
}
	


?>