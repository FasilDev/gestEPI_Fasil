---
title: Note de conception API GestEPI

---

# **Note de conception d’architecture API gestion des avions et des techniciens de la base aérienne d'Istres**

* **Modèle conceptuel/physique des données :**

Deux concept principales seront gérées par l'API : les avions et les techniciens. Les entretiens effectués par les techniciens sur les avions devront également être pris en considération.

*  **Modèle conceptuel :**

***Avion***
 
> **id** (int) : Identifiant unique de l'avion
> **model** (varchar) : Modèle de l'avion 
> **marque** (varchar) : Marque de l'avion
> **date_dernier_entretien** (Date) : Date du dernier entretien de l'avion

 ***Technicien***
 
> **id** (int) : Identifiant unique du technicien
> **nom** (varchar) : Nom du technicien
> **prenom**(varchar) : Prénom du technicien
> **secteur** (varchar) : Secteur du technicien (ex : Mécanique, Systèmes électroniques)
 
 ***Entretien***

> **id** (int) : Identifiant unique de l'entretien
> **avion_id** (int) : Référence vers l'avion concerné
> **technicien_id** (int) : Référence vers le technicien ayant réalisé l'entretien
> **date** (Date) : Date de l'entretien

* **Modèle physique sous format de schéma relationnel :**

![image](https://hackmd.io/_uploads/ryQ2SWuCR.png)

* **Liste des endpoints :**

| Endpoint            | Paramètres                                  | Description                                 |
| ------------------- | ------------------------------------------- | ------------------------------------------- |
| **GET** /avions     | Aucun                                       | Retourne tous les avions                    |
| **POST** /avions    | Aucun                                       | Ajouter un nouvel avion.                    |
| **GET** /avions/    | ?id - number ?model -string ?marque -string | Récupérer les détails d'un avion spécifique |
| **PUT** /avions/    | ?id -number                                        | Mettre à jour les informations d’un avion.  |
| **DELETE** /avions/ | ?id -number                                        | Supprimer un avion.                         |
| **GET** /techniciens/ | Aucun | Retourne tous les techniciens |
| **POST** /techniciens/ | Aucun | Ajouter un nouveau technicien |
| **GET** /tehniciens/     | ?id -number    | Retourne le technicien correspondant à l'id     |
| **PUT** /techniciens/ | ?id -number | Mettre à jour les informations d'un technicien |
| **DELETE** /techniciens/ | ?id -number | Supprimer un technicien |
| **GET** /entretiens/    | Aucun     | Retourne tous les entretiens     |
| **POST** /entretiens/ | Aucun | Ajouter un nouvel entretien |
| **GET** /entretiens/ | ?id -number | Retourne l'entretien correspondant à l'id|
| **PUT** /entretiens/     | ?id -number     | Met à jour les information de l'entretien correspondant à l'id     |
|**DELETE** /entretiens/ | ?id -number | Supprime l'entretien correspondant à l'id |

* **En cas d'erreur :**

| Endpoint              | Erreur                                                   | Description                                                                 |
|-----------------------|----------------------------------------------------------|-----------------------------------------------------------------------------|
| **GET** /avions/        | AUCUN AVION TROUVÉ                                       | Aucun avion n'a été trouvé dans la base de données.                         |
| **POST** /avions/       | AUCUN AVION AJOUTÉ – Peut-être manque-t-il des données.   | L'avion n'a pas été ajouté. Il manque peut-être des informations.           |
| **GET** /avions/        | AUCUN AVION TROUVÉ – AVEC CES PARAMÈTRES : ${params}      | Impossible de récupérer l'avion correspondant aux paramètres envoyés.       |
| **PUT** /avions/        | AUCUN AVION MODIFIÉ – ID introuvable                     | Impossible de mettre à jour l'avion, l'ID spécifié n'existe pas en base de données. |
| **DELETE** /avions/     | AUCUN AVION SUPPRIMÉ – ID introuvable                    | Impossible de supprimer l'avion, l'ID spécifié n'existe pas en base de données. |
| **GET** /techniciens/   | AUCUN TECHNICIEN TROUVÉ                                  | Aucun technicien n'a été trouvé dans la base de données.                    |
| **POST** /techniciens/  | AUCUN TECHNICIEN AJOUTÉ – Peut-être manque-t-il des données.| Le technicien n'a pas été ajouté. Il manque peut-être des informations.     |
| **GET** /techniciens/   | AUCUN TECHNICIEN TROUVÉ – AVEC L'ID : ${params["id"]}    | Impossible de récupérer le technicien correspondant à l'ID passé en paramètre. |
| **PUT**  /techniciens/  | AUCUN TECHNICIEN MODIFIÉ – ID introuvable                | Impossible de mettre à jour les informations, l'ID du technicien n'existe pas. |
| **DELETE** /techniciens| AUCUN TECHNICIEN SUPPRIMÉ – ID introuvable               | Impossible de supprimer le technicien, l'ID spécifié n'existe pas.          |
| **GET**  /entretiens/      | AUCUN ENTRETIEN TROUVÉ                                   | Aucun entretien n'a été trouvé dans la base de données.                     |
| **POST** /entretiens/      | AUCUN ENTRETIEN AJOUTÉ – Peut-être manque-t-il des données.| L'entretien n'a pas été ajouté. Il manque peut-être des informations.       |
| **GET** /entretiens/       | AUCUN ENTRETIEN TROUVÉ – AVEC L'ID : ${params["id"]}     | Impossible de récupérer l'entretien correspondant à l'ID passé en paramètre.|
| **PUT**  /entretiens/      | AUCUN ENTRETIEN MODIFIÉ – ID introuvable                 | Impossible de mettre à jour l'entretien, l'ID spécifié n'existe pas en base de données. |
| **DELETE**  /entretiens/   | AUCUN ENTRETIEN SUPPRIMÉ – ID introuvable                | Impossible de supprimer l'entretien, l'ID spécifié n'existe pas en base de données. |

Repo Github : https://github.com/FasilDev/gestEPI_Fasil.git