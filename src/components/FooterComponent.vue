<template>
    <div class="footer">
        <img class="ruins" src="@/assets/image/footer.svg" alt="" />
        <div class="words">
            <span class="quote1">MAKE THE</span>
            <span class="logo">CH</span>
            <span class="quote2">ANGES</span>
        </div>
        <div class="social">
            <i class="fa-brands fa-facebook"></i>
            <i class="fa-brands fa-instagram"></i>
            <i class="fa-solid fa-envelope"></i>
        </div>
        <div class="copyright">&copy;2024 CHING-HSUN LIN</div>
    </div>
</template>

<style lang="css" scoped>
.footer {
    position: relative;
    width: 100%;
    padding: 20px;
    background: linear-gradient(to bottom, #011b2c 0%, #000d16 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    text-transform: uppercase;
    overflow: hidden;
}

.ruins {
    position: absolute;
    bottom: -10%;
    left: 0;
    width: 100%;
    height: auto;
    z-index: 1;
}

.words {
    display: flex;
    margin-bottom: 5.2rem;
    justify-content: center;
    align-items: center;
    font-size: 32px;
    font-weight: 600;
}

.logo {
    color: #000000;
    font-weight: 700;
    z-index: 3;
}

.quote1 {
    color: #ffffff;
    padding-right: 1rem;
}

.quote2 {
    color: #ffffff;
    padding-right: 3.9rem;
}

.social {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6.5rem;
    margin: 1rem 4rem 1rem 0;
    font-size: 48px;
    z-index: 2;
}

.copyright {
    position: absolute;
    bottom: 5%;
    right: 5.7%;
    color: #c7c7c7;
    font-size: 22px;
    margin-top: 1rem;
    z-index: 2;
}

@media (max-width: 1024px) {
    .words {
        font-size: 28px;
        margin: 0.5rem 0;
    }
    .logo {
        color: #ffffff;
        font-weight: 600;
    }
    .quote1 {
        padding-right: 0.5rem;
    }
    .quote2 {
        padding-right: 0;
    }
    .social {
        font-size: 40px;
        gap: 2rem;
        margin: 1rem 0;
    }
    .copyright {
        position: relative;
        color: #c7c7c7;
        font-size: 20px;
        margin-top: 1rem;
        z-index: 2;
        right: 0%;
    }
}

@media (max-width: 768px) {
    .words {
        position: relative;
        font-size: 24px;
        margin: 0.5rem auto;
    }
    .logo {
        color: #ffffff;
        font-weight: 600;
    }
    .quote1 {
        padding-right: 0.5rem;
    }
    .quote2 {
        padding-right: 0;
    }
    .social {
        font-size: 36px;
        gap: 1.5rem;
        margin: 1rem 0;
    }
    .copyright {
        position: relative;
        font-size: 16px;
        right: 0%;
    }
}

@media (max-width: 480px) {
    .words {
        position: relative;
        font-size: 20px;
        margin: 0.5rem auto;
    }
    .logo {
        color: #ffffff;
        font-weight: 600;
    }
    .quote1 {
        padding-right: 0.5rem;
    }
    .quote2 {
        padding-right: 0;
    }
    .social {
        font-size: 32px;
        gap: 1rem;
        margin: 1rem 0;
    }
    .copyright {
        position: relative;
        font-size: 14px;
        right: 0%;
    }
}
</style>
