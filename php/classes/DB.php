<?php

$IDEmpresa = $_SESSION['IDEmpresa'];

//declarar  uma classe responsável pela conexão com o Banco de Dados

// chamando a classe responsável pelos parâmetros de config do banco
require_once '../php/conexoes/'.$IDEmpresa.'config.php';

class DB{
    //criando uma propriedade chamada instancia
    private static $instance;
    
    //método getInstance() - pega a instancia
    public static function getInstance(){
    
    //condição-> se a instância não foi selecionada
    if(!isset(self::$instance)){
        
        try{
            //tente fazer a conexão
            self::$instance = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
            self::$instance->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
            self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE,PDO::FETCH_OBJ);           
            
        } catch (PDOException $ex) {
            //se conexão falhar exiba mensagem de erro
            print $ex->getMessage();
        }        
    }
    return self::$instance;
    
    }
    //declarando o método prepare() - prepara o SQL para utilização @param $sql
    public static function prepare($sql){
        return self::getInstance()->prepare($sql);//conexao abertura do sql
    }    
}
