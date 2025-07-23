<?php

//Iniciando a sessão:
if (session_status() !== PHP_SESSION_ACTIVE) {
	session_start();
}

$nuempresalogin = $_SESSION['empusuario'];

////variável que define o ambiente de desenvolvimento do sistema d = Desenvolvimento, h = Homologação, p = Produção

//conexão desenvolvimento
//$ambiente = 'gtosapdesenvolvimento';
//$host = '201.73.1.59';
//conexão produção
$ambiente = 'gtosap35';
//$host = 'opmy0030.servidorwebfacil.com';
$host = 'opmy0032.servidorwebfacil.com';
$senha = 'a21k1974';

switch ($ambiente) {
    case 'gtosap35':
        $user = 'ander_gto_'.$nuempresalogin;
        $banco = 'anderson35_gto_prod';
		break;
	case 'gtosap':
        $user = 'ander_gto_web01';
        $banco = 'anderson34_gto_quality';
        break;
	case 'gtosapdesenvolvimento':
        $user = 'usr_quality';
        $banco = 'dbquality';
		break;
	case 'gtosaphomologacao':
        $user = 'ander_etl_01';
        $banco = 'anderson34_gto_homologacao';
        break;
	}
//constantes que definem as configurações do Banco
define('DB_HOST', $host); //servidor
define('DB_PASS', $senha);//senha
define('DB_USER', $user); //usuário
define('DB_NAME', $banco);//nome do banco

//Variável de conexão para arquivos que não utilizam as classes
$con = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));

########### AUTO LOAD DE CLASSES #########

spl_autoload_register(function ($Class) {
	
	$cDir = ['Conn','../classes'];
	$iDir = null;
	
	foreach ($cDir as $dirName):
		if (!$iDir && file_exists(__DIR__ . DIRECTORY_SEPARATOR . $dirName . DIRECTORY_SEPARATOR . $Class.'.php') && !is_dir(__DIR__ . DIRECTORY_SEPARATOR . $dirName . DIRECTORY_SEPARATOR . $Class.'.php')):
			include_once (__DIR__ . DIRECTORY_SEPARATOR . $dirName . DIRECTORY_SEPARATOR . $Class.'.php');
			$iDir = true;
		endif;
	endforeach;
	

});


