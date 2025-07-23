<?php

/**
 * <b>Create.class:</b>
 * Classe responsável por cadastros genéticos no banco de dados!
 *
 * @copyright (c) 2016, Lucas B. Alencar
 */
class Create extends Conn {

    private $Tabela;
    private $Dados;
    private $Result;
    private $Error;

    /** @var PDOStatement */
    private $Create;

    /** @var PDO */
    private $Conn;


    public function ExeCreate($Tabela, array $Dados) {
        $this->Tabela = (string) $Tabela;
        $this->Dados = $Dados;
        
        $this->getSyntax();
        $this->Execute();
    }


    public function getResult() {
        return $this->Result;
    }


    //Obtém o PDO e Prepara a query
    private function Connect() {
        $this->Conn = parent::getConn();
        $this->Create = $this->Conn->prepare($this->Create);
    }

    //Cria a sintaxe da query para Prepared Statements
    private function getSyntax() {
        $Fileds = implode(', ', array_keys($this->Dados));
        $Places = ':' . implode(', :', array_keys($this->Dados));
        $this->Create = "INSERT INTO {$this->Tabela} ({$Fileds}) VALUES ({$Places})";
    }

    //Obtém a Conexão e a Syntax, executa a query!
    private function Execute() {
        $this->Connect();
        try {
            $this->Create->execute($this->Dados);
            $this->Result = $this->Conn->lastInsertId();
        } catch (PDOException $e) {
            $this->Result = null;
            print_r("<b>Erro ao cadastrar:</b> {$e->getMessage()}");
        }
    }
    
      public function getError() {
        return $this->Error;
    }

}
