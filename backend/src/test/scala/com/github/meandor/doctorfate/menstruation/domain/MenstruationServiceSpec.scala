package com.github.meandor.doctorfate.menstruation.domain
import akka.Done
import com.github.meandor.doctorfate.UnitSpec
import com.github.meandor.doctorfate.menstruation.data.{MenstruationEntity, MenstruationRepository}
import org.mockito.ArgumentMatchers.any
import org.scalatest.concurrent.ScalaFutures

import java.time.LocalDate
import java.util.UUID
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class MenstruationServiceSpec extends UnitSpec with ScalaFutures {
  Feature("create") {
    val menstruationRepository = mock[MenstruationRepository]
    val menstruationService    = new MenstruationService(menstruationRepository)

    Scenario("should return successfully created menstruation") {
      val userId = UUID.randomUUID()
      val menstruation = Menstruation(
        start = LocalDate.now(),
        end = LocalDate.now()
      )
      val createdMenstruationEntity = MenstruationEntity(
        userId = userId,
        start = menstruation.start,
        end = menstruation.end
      )
      menstruationRepository.find(any[MenstruationEntity]) shouldReturn Future.successful(None)
      menstruationRepository.create(any[MenstruationEntity]) shouldReturn Future.successful(
        createdMenstruationEntity
      )

      val actual = menstruationService.create(userId, menstruation)
      val expected = Some(
        Menstruation(
          createdMenstruationEntity.start,
          createdMenstruationEntity.end
        )
      )

      actual.futureValue shouldBe expected
    }

    Scenario("should return None when time range for user already exists") {
      val userId = UUID.randomUUID()
      val menstruation = Menstruation(
        start = LocalDate.now(),
        end = LocalDate.now()
      )
      val existingMenstruationEntity = MenstruationEntity(
        userId = userId,
        start = menstruation.start,
        end = menstruation.end
      )
      menstruationRepository.find(any[MenstruationEntity]) shouldReturn Future.successful(
        Some(existingMenstruationEntity)
      )

      val actual   = menstruationService.create(userId, menstruation)
      val expected = None

      actual.futureValue shouldBe expected
    }
  }

  Feature("find") {
    val menstruationRepository = mock[MenstruationRepository]
    val menstruationService    = new MenstruationService(menstruationRepository)

    Scenario("should return all menstruation for user") {
      val userId = UUID.randomUUID()
      val menstruationEntity = MenstruationEntity(
        userId = userId,
        start = LocalDate.now(),
        end = LocalDate.now()
      )
      menstruationRepository.findByUser(any[UUID]) shouldReturn Future.successful(
        Seq(menstruationEntity)
      )

      val actual = menstruationService.find(userId)
      val expected = Seq(
        Menstruation(start = menstruationEntity.start, end = menstruationEntity.end)
      )

      actual.futureValue shouldBe expected
    }
  }

  Feature("delete") {
    val menstruationRepository = mock[MenstruationRepository]
    val menstruationService    = new MenstruationService(menstruationRepository)

    Scenario("should delete menstruation for user") {
      val userId = UUID.randomUUID()
      val menstruation = Menstruation(
        start = LocalDate.now(),
        end = LocalDate.now()
      )
      menstruationRepository.delete(any[MenstruationEntity]) shouldReturn Future.successful(1)

      val actual   = menstruationService.delete(userId, menstruation)
      val expected = Some(Done)

      actual.futureValue shouldBe expected
    }

    Scenario("should return None when repository returns 0") {
      val userId = UUID.randomUUID()
      val menstruation = Menstruation(
        start = LocalDate.now(),
        end = LocalDate.now()
      )
      menstruationRepository.delete(any[MenstruationEntity]) shouldReturn Future.successful(0)

      val actual   = menstruationService.delete(userId, menstruation)
      val expected = None

      actual.futureValue shouldBe expected
    }
  }

  Feature("changeOwner") {
    val menstruationRepository = mock[MenstruationRepository]
    val menstruationService    = new MenstruationService(menstruationRepository)

    Scenario("should change owner of one menstruation") {
      val userId = UUID.randomUUID()
      val menstruation = MenstruationEntity(
        userId,
        LocalDate.now(),
        LocalDate.now()
      )
      menstruationRepository.findByUser(userId) shouldReturn Future.successful(Seq(menstruation))
      menstruationRepository.saveWithNewUserId(any[MenstruationEntity], any[UUID]) shouldReturn Future
        .successful(1)

      val actual   = menstruationService.changeOwner(userId)
      val expected = Done

      actual.futureValue shouldBe expected
    }
  }
}
