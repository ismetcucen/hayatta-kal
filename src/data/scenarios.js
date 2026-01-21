export const scenarios = [
    {
        id: "deprem",
        title: "Deprem Senaryosu",
        intro: "Sınıftasın ve aniden yer sallanmaya başladı. Çok şiddetli bir deprem oluyor!",
        steps: [
            {
                id: 1,
                question: "İlk tepkin ne olur?",
                options: [
                    {
                        text: "Hemen merdivenlere koşup dışarı kaçarım",
                        riskChanges: 80,
                        feedback: "YANLIŞ! Deprem anında merdivenler en zayıf yerlerdir ve yıkılabilir. Ayrıca panikle düşebilirsin. Vücudun ciddi darbe aldı!"
                    },
                    {
                        text: "Sıranın yanına Çök-Kapan-Tutun yaparım",
                        riskChanges: 0,
                        feedback: "DOĞRU! Hayat üçgeni oluşturmak için en güvenli hareket budur. Sarsıntı bitene kadar bekle."
                    },
                    {
                        text: "Pencereden aşağı atlarım",
                        riskChanges: 100,
                        feedback: "ÇOK TEHLİKELİ! Cam kırıkları ve yüksekten düşme sonucu hayati tehlike oluştu."
                    },
                    {
                        text: "Dolabın içine saklanırım",
                        riskChanges: 60,
                        feedback: "YANLIŞ! Dolap devrilebilir ve içinde sıkışabilirsin. Sıra yanı daha güvenlidir."
                    }
                ]
            },
            {
                id: 2,
                question: "Sarsıntı bitti, şimdi ne yapmalısın?",
                options: [
                    {
                        text: "Hızla asansöre binip inerim",
                        riskChanges: 50,
                        feedback: "HATA! Depremden sonra elektrik kesilebilir veya asansör bozulabilir. Asansörde mahsur kalırsın."
                    },
                    {
                        text: "Sakin olup, öğretmenin talimatıyla merdivenlerden inerim",
                        riskChanges: 0,
                        feedback: "HARİKA! Panik yapmadan tahliye planına uymak seni kurtarır."
                    },
                    {
                        text: "Sınıfta kalıp dersin devam etmesini beklerim",
                        riskChanges: 40,
                        feedback: "YANLIŞ! Artçı depremler olabilir, bina hasar görmüş olabilir. Dışarı çıkmalısın."
                    },
                    {
                        text: "Koşarak kantine giderim",
                        riskChanges: 30,
                        feedback: "YANLIŞ! Panik yapmak ve gruptan ayrılmak güvenliğini tehlikeye atar."
                    }
                ]
            },
            {
                id: 3,
                question: "Binadan çıktın. Nerede beklemelisin?",
                options: [
                    {
                        text: "Binanın hemen dibinde",
                        riskChanges: 60,
                        feedback: "YANLIŞ! Artçı sarsıntılarla camlar veya balkonlar üzerine düşebilir."
                    },
                    {
                        text: "Toplanma alanında, binalardan uzak açık bir yerde",
                        riskChanges: 0,
                        feedback: "DOĞRU! En güvenli yer açık alanlardır."
                    },
                    {
                        text: "Eve koşup ailemi ararım",
                        riskChanges: 20,
                        feedback: "RİSKLİ! Önce öğretmenlerine bilgi verip toplanma alanında sayım yapılmasına katılmalısın."
                    },
                    {
                        text: "Elektrik direğinin altına sığınırım",
                        riskChanges: 70,
                        feedback: "TEHLİKELİ! Direkler devrilebilir veya elektrik çarpabilir."
                    }
                ]
            }
        ]
    },
    {
        id: "sel",
        title: "Sel Senaryosu",
        intro: "Dışarıda günlerdir süren sağanak yağış ani bir sele dönüştü. Sular hızla yükseliyor!",
        steps: [
            {
                id: 1,
                question: "Dere yatağına yakın bir evdesin, su seviyesi kapıya ulaştı. Ne yaparsın?",
                options: [
                    {
                        text: "Eşyaları kurtarmak için bodruma inerim",
                        riskChanges: 100,
                        feedback: "HAYATİ HATA! Bodrum katları suyla en hızlı dolan ölüm tuzaklarıdır."
                    },
                    {
                        text: "Hemen üst katlara veya çatıya çıkarım",
                        riskChanges: 0,
                        feedback: "DOĞRU! Yükselen sudan kaçmanın en iyi yolu yükseğe çıkmaktır."
                    },
                    {
                        text: "Arabaya binip uzaklaşmaya çalışırım",
                        riskChanges: 70,
                        feedback: "YANLIŞ! Sel suları araçları kolayca sürükleyebilir ve içinde mahsur kalabilirsin."
                    },
                    {
                        text: "Kapıyı açıp suyu süpürgeyle dışarı atmaya çalışırım",
                        riskChanges: 50,
                        feedback: "HATA! Sel suyu çok güçlüdür, kapıyı açarsan evi anında su basar."
                    }
                ]
            },
            {
                id: 2,
                question: "Suda sürüklenen birini gördün, elinde ip yok. Ne yaparsın?",
                options: [
                    {
                        text: "Suya atlayıp onu tutmaya çalışırım",
                        riskChanges: 90,
                        feedback: "ÇOK RİSKLİ! Akıntı seni de sürükleyip boğabilir. Asla suya girme."
                    },
                    {
                        text: "Ona uzatabileceğim uzun bir sopa veya dal ararım",
                        riskChanges: 0,
                        feedback: "HARİKA! Kıyıdan ayrılmadan ona bir cisim uzatmak en güvenli yöntemdir."
                    },
                    {
                        text: "Sadece bağırarak ona moral veririm",
                        riskChanges: 10,
                        feedback: "YETERSİZ. Moral vermek iyidir ama fiziksel yardım şansı varsa (sopa uzatmak gibi) denenmelidir."
                    },
                    {
                        text: "Fotoğrafını çekip sosyal medyaya atarım",
                        riskChanges: 0,
                        feedback: "YANLIŞ! Hayati bir durumda öncelik yardım çağırmak veya yardım etmektir."
                    }
                ]
            }
        ]
    },
    {
        id: "cig",
        title: "Çığ Senaryosu",
        intro: "Kış mevsiminde, dik yamaçlı bir dağ yolunda yürüyüş yapıyorsun. Yukarıdan çığ koptuğunu gördün!",
        steps: [
            {
                id: 1,
                question: "Çığ büyük bir gürültüyle üzerine geliyor. İlk tepkin?",
                options: [
                    {
                        text: "Çığın akış yönünün tersine, yukarı doğru koşarım",
                        riskChanges: 80,
                        feedback: "İMKANSIZ! Çığ senden çok daha hızlıdır, yukarı koşarak kaçamazsın."
                    },
                    {
                        text: "Yana doğru (çığın rotasından çıkacak şekilde) hızla kaçarım",
                        riskChanges: 0,
                        feedback: "DOĞRU! Çığın merkezinden uzaklaşmak kurtulma şansını artırır."
                    },
                    {
                        text: "Olduğum yerde çöküp beklerim",
                        riskChanges: 90,
                        feedback: "YANLIŞ! Hareket etmezsen tonlarca karın altında kalırsın."
                    },
                    {
                        text: "Ağaca tırmanmaya çalışırım",
                        riskChanges: 60,
                        feedback: "RİSKLİ! Çığ ağaçları da kökünden sökebilir."
                    }
                ]
            },
            {
                id: 2,
                question: "Kaçamadın ve çığ seni sürüklemeye başladı. Ne yapmalısın?",
                options: [
                    {
                        text: "Yüzme hareketi yaparak yüzeyde kalmaya çalışırım",
                        riskChanges: 20, // Still risky but avoids death
                        feedback: "DOĞRU! Yüzme hareketleri seni karın yüzeyine yakın tutar."
                    },
                    {
                        text: "Kollarımı bağlayıp hareketsiz dururum",
                        riskChanges: 100,
                        feedback: "HATA! Hareketsiz kalırsan dibe batarsın ve havasızlıktan boğulursun."
                    },
                    {
                        text: "Ağzımı sonuna kadar açıp bağırırım",
                        riskChanges: 50,
                        feedback: "YANLIŞ! Ağzına ve ciğerlerine kar dolarak boğulmana neden olabilir."
                    },
                    {
                        text: "Ayaklarımı öne uzatıp fren yapmaya çalışırım",
                        riskChanges: 40,
                        feedback: "ZOR! Kar akışkandır, fren tutmaz. Öncelik yüzeyde kalmaktır."
                    }
                ]
            }
        ]
    },
    {
        id: "yangin",
        title: "Orman Yangını Senaryosu",
        intro: "Tatil için bulunduğun bölgede aniden duman kokusu aldın ve ormanlık alandan alevlerin yükseldiğini gördün. Rüzgar şiddetli!",
        steps: [
            {
                id: 1,
                question: "Yangını fark ettiğin an ilk ne yaparsın?",
                options: [
                    {
                        text: "Hemen yangına doğru koşup söndürmeye çalışırım",
                        riskChanges: 90,
                        feedback: "ÇOK TEHLİKELİ! Eğitimin ve ekipmanın yoksa yangına müdahale etmek hayatını riske atar. Duman zehirlenmesi yaşayabilirsin."
                    },
                    {
                        text: "Rüzgarı arkama alarak güvenli bir alana uzaklaşır ve 112'yi ararım",
                        riskChanges: 0,
                        feedback: "DOĞRU! Önce kendi güvenliğini sağla, sonra yetkililere haber ver."
                    },
                    {
                        text: "Video çekip sosyal medyada paylaşırım",
                        riskChanges: 50,
                        feedback: "YANLIŞ! Zaman kaybediyorsun. Yangın çok hızlı yayılabilir."
                    }
                ]
            },
            {
                id: 2,
                question: "Tahliye emri verildi. Arabana bindin ama yoğun duman var. Ne yapmalısın?",
                options: [
                    {
                        text: "Klimayı 'dış hava' modunda çalıştırıp son sürat giderim",
                        riskChanges: 70,
                        feedback: "YANLIŞ! Dışarıdan dumanı içeri çekersin. Zehirlenme riski!"
                    },
                    {
                        text: "Camları kapatır, klimayı 'iç sirkülasyon' moduna alır, farları yakar ve yavaşça ilerlerim",
                        riskChanges: 0,
                        feedback: "DOĞRU! Dumanın içeri girmesini engelledin ve görünürlüğünü artırdın."
                    },
                    {
                        text: "Camları açıp dumanı elle dağıtmaya çalışırım",
                        riskChanges: 100,
                        feedback: "KRİTİK HATA! Duman ciğerlerine doldu. Bilincini kaybedebilirsin."
                    }
                ]
            }
        ]
    }
];
