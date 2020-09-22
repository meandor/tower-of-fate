package com.github.meandor.doctorfate

import java.util.concurrent.Executors

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.Behaviors
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
import com.github.meandor.doctorfate.auth.data.{AuthenticationRepository, TokenRepository}
import com.github.meandor.doctorfate.auth.domain.TokenService
import com.github.meandor.doctorfate.auth.presentation.TokenController
import com.typesafe.scalalogging.LazyLogging
import org.apache.commons.dbcp2.BasicDataSource
import org.flywaydb.core.Flyway

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor}

object DoctorFate extends LazyLogging {
  def main(args: Array[String]): Unit = {
    logger.info("Starting System")
    implicit val system: ActorSystem[Nothing]               = ActorSystem(Behaviors.empty, "doctorFate")
    implicit val executionContext: ExecutionContextExecutor = system.executionContext

    logger.info("Start db migrations")
    val dbURI                       = System.getenv("DATABASE_URL")
    val dataSource: BasicDataSource = new BasicDataSource()
    dataSource.setUrl(dbURI)
    val flyway = Flyway.configure.dataSource(dataSource).load
    flyway.migrate()
    logger.info("Done db migrations")

    logger.info("Start connecting to DB")
    val databaseEC               = ExecutionContext.fromExecutor(Executors.newFixedThreadPool(8))
    val authenticationRepository = new AuthenticationRepository(databaseEC)
    val tokenRepository          = new TokenRepository(databaseEC)
    logger.info("Done connecting to DB")

    logger.info("Start loading Token Module")
    val tokenService    = new TokenService(authenticationRepository, tokenRepository)
    val jwtIDSecret     = System.getenv("JWT_ID_SECRET")
    val tokenController = new TokenController(jwtIDSecret, tokenService)
    logger.info("Done loading Token Module")

    logger.info("Start composing routes")
    val route: Route = BaseRoutes.routes ~ tokenController.routes
    logger.info("Done composing routes")

    val maybePort: Option[String] = Option(System.getenv("PORT"))
    val defaultPort: Int          = 8080
    val port: Int                 = maybePort.fold(defaultPort)(p => p.toInt)
    val interface: String         = "0.0.0.0"
    logger.info(s"Starting Server at: ${interface} on port: ${port}")
    Http()
      .newServerAt(interface, port)
      .bind(route)
      .map(_.addToCoordinatedShutdown(hardTerminationDeadline = 10.seconds))
    logger.info(s"Server started")
  }
}
